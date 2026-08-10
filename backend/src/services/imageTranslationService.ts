import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import { AppDataSource } from '../config/database';
import { Translation } from '../models/Translation';
import { Document } from '../models/Document';
import { translationApiService } from './translationApiService';
import { quotaService } from './quotaService';
import { documentService } from './documentService';
import { encryptionService } from './encryptionService';
import * as fs from 'fs/promises';
import * as path from 'path';
import { env } from '../config/env';

const TRANSLATED_PREFIX = 'translated-';

export class ImageTranslationService {
  private translationRepository = AppDataSource.getRepository(Translation);
  private documentRepository = AppDataSource.getRepository(Document);

  /**
   * Translate text in an image and re-render it with translated text.
   * Steps: OCR -> translate text -> white-out source regions -> draw translated text.
   */
  async translateImage(
    documentId: string,
    userId: string,
    targetLanguage: string,
    provider?: string
  ): Promise<{ translationId: string; translatedImagePath: string }> {
    const document = await this.documentRepository.findOne({ where: { id: documentId } });
    if (!document) {
      throw new Error('Document not found');
    }
    if (document.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const format = document.originalFormat?.toLowerCase() || '';
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp'];
    if (!imageFormats.includes(format)) {
      throw new Error('Document is not an image file');
    }

    // Create translation record first
    const translation = this.translationRepository.create({
      documentId,
      userId,
      sourceLanguage: document.sourceLanguage || 'auto',
      targetLanguage,
      targetLanguages: [targetLanguage],
      outputFormats: ['png'],
      approvalStatus: 'approved',
    });
    const savedTranslation = await this.translationRepository.save(translation);

    try {
      // Read the original image
      const { buffer: originalBuffer } = await documentService.readFileBuffer(documentId, userId);
      const image = sharp(originalBuffer);
      const metadata = await image.metadata();
      const width = metadata.width || 1000;
      const height = metadata.height || 1000;

      // OCR the image
      const worker = await createWorker('eng');
      const { data } = (await worker.recognize(originalBuffer)) as any;
      const lines = (data.lines || []).filter(
        (l: any) => l.text && l.text.trim().length > 0
      );

      // Determine text color for drawing (sample top-left pixels)
      // Default to black text on light background
      let textColor = '#000000';

      // Translate each line
      const resolvedProvider =
        provider ||
        (await translationApiService.getAvailableProviders(userId))[0] ||
        'deepl';

      const translatedLines: { text: string; bbox: any; original: string }[] = [];
      let tokensUsed = 0;

      for (const line of lines) {
        const original = line.text.trim();
        if (!original) continue;
        try {
          const result = await translationApiService.translate(
            resolvedProvider,
            {
              text: original,
              sourceLanguage: document.sourceLanguage || 'auto',
              targetLanguage,
            },
            userId
          );
          tokensUsed += result.tokensUsed;
          translatedLines.push({
            text: result.translatedText,
            bbox: line.bbox,
            original,
          });
        } catch (err) {
          // Skip lines that fail to translate; keep original position blank
          console.error('Line translation failed:', err);
        }
      }

      await worker.terminate();

      // Build an SVG overlay with translated text
      // First white-out the source regions, then draw translated text
      const svgLines: string[] = [];
      for (const tl of translatedLines) {
        const b = tl.bbox;
        const boxWidth = Math.max(b.x1 - b.x0, 40);
        const boxHeight = Math.max(b.y1 - b.y0, 16);
        const fontSize = Math.max(Math.floor(boxHeight * 0.7), 10);
        const pad = 2;

        // White-out the original text region
        svgLines.push(
          `<rect x="${Math.max(b.x0 - pad, 0)}" y="${Math.max(b.y0 - pad, 0)}" ` +
            `width="${boxWidth + pad * 2}" height="${boxHeight + pad * 2}" fill="white"/>`
        );

        // Draw the translated text (truncated to fit the box)
        const fontFamily = "'Helvetica', 'Arial', sans-serif";
        const fitted = fitText(tl.text, boxWidth, fontSize);
        svgLines.push(
          `<text x="${b.x0}" y="${b.y1 - 3}" font-family="${fontFamily}" ` +
            `font-size="${fontSize}" fill="${textColor}">${escapeXml(fitted)}</text>`
        );
      }

      const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgLines.join('')}</svg>`;

      const translatedImage = await image
        .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
        .png()
        .toBuffer();

      // Save the translated image
      const translatedPath = path.join(
        env.FILE_UPLOAD_DIR,
        `${TRANSLATED_PREFIX}${savedTranslation.id}.png`
      );
      await fs.mkdir(path.dirname(translatedPath), { recursive: true });
      await fs.writeFile(translatedPath, translatedImage);

      // Save OCR'd original text + translated text in the translation record
      savedTranslation.originalContent = {
        [document.sourceLanguage || 'auto']: lines.map((l: any) => l.text).join('\n'),
      };
      savedTranslation.translatedContent = {
        [targetLanguage]: translatedLines.map((t) => t.text).join('\n'),
        _provider: resolvedProvider,
        _translatedAt: new Date().toISOString(),
        _imageOutputPath: translatedPath,
        _isImage: true,
      };
      savedTranslation.tokensUsed = tokensUsed;
      await this.translationRepository.save(savedTranslation);

      // Update usage
      await quotaService.updateUsage(userId, 1, tokensUsed, 0, resolvedProvider);

      return {
        translationId: savedTranslation.id,
        translatedImagePath: translatedPath,
      };
    } catch (error) {
      savedTranslation.translatedContent = {
        _error: error instanceof Error ? error.message : 'Image translation failed',
      };
      await this.translationRepository.save(savedTranslation);
      throw error;
    }
  }

  /**
   * Read the translated image file for a translation (if it is an image translation).
   */
  async getTranslatedImage(
    translationId: string,
    userId: string
  ): Promise<{ buffer: Buffer; mimeType: string } | null> {
    const translation = await this.translationRepository.findOne({ where: { id: translationId } });
    if (!translation) return null;
    if (translation.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const content = translation.translatedContent as any;
    if (!content?._imageOutputPath) return null;

    const buffer = await fs.readFile(content._imageOutputPath);
    return { buffer, mimeType: 'image/png' };
  }
}

/** Simple XML escaping for SVG text */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Truncate text to fit width based on average character width */
function fitText(text: string, maxWidth: number, fontSize: number): string {
  const avgCharWidth = fontSize * 0.55;
  const maxChars = Math.max(Math.floor(maxWidth / avgCharWidth), 4);
  if (text.length <= maxChars) return text;
  return text.slice(0, Math.max(maxChars - 3, 1)) + '...';
}

export const imageTranslationService = new ImageTranslationService();
