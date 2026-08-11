import { Request, Response } from 'express';
import { translationService } from '../services/translationService';
import { translationApiService } from '../services/translationApiService';
import { imageTranslationService } from '../services/imageTranslationService';
import { quotaService } from '../services/quotaService';
import { CONSTANTS } from '../config/constants';

export class TranslationController {
  /**
   * Create translation request
   */
  async createTranslation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { documentId, targetLanguages, outputFormat, provider, sourceLanguage } = req.body;

      if (!documentId || !targetLanguages || !Array.isArray(targetLanguages)) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'documentId and targetLanguages are required',
        });
      }

      const translation = await translationService.createTranslation(
        documentId,
        req.user.id,
        sourceLanguage || 'en',
        targetLanguages,
        [outputFormat || 'pdf'],
        provider
      );

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Translation request created',
        data: translation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create translation';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get translation
   */
  async getTranslation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const translation = await translationService.getTranslationById(id);
      if (!translation) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Translation not found',
        });
      }

      if (req.user && translation.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'Unauthorized',
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Translation retrieved',
        data: { translation: translationService.serializeTranslation(translation) },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get translation';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get user's translations
   */
  async getUserTranslations(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        CONSTANTS.MAX_PAGE_SIZE,
        parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE
      );

      const { translations, total } = await translationService.getUserTranslations(
        req.user.id,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Translations retrieved',
        data: translations.map((t) => translationService.serializeTranslation(t)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get translations';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Download translation
   */
  async downloadTranslation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const translation = await translationService.getTranslationById(id);
      if (!translation) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Translation not found',
        });
      }

      if (req.user && translation.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'Unauthorized',
        });
      }

      const translatedContent = translation.translatedContent || {};
      if ((translatedContent as any)._error) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Translation failed or is not ready. Error: ' + (translatedContent as any)._error,
        });
      }

      // Resolve format: use query param, or fall back to first stored output format, or txt
      const requestedFormat = (req.query.format as string) || '';
      const storedFormats = (translation as any).outputFormats || [];
      const format = requestedFormat || storedFormats[0] || 'txt';

      const targetLang = translation.targetLanguage || (translation.targetLanguages || [])[0] || 'translated';
      const text = (translatedContent as any)[targetLang] || '';

      if (!text) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'No translated content available to download',
        });
      }

      await translationService.incrementDownloadCount(id);

      const doc = translation.document;
      const baseName = (doc?.filename || 'translation').replace(/\.[^.]+$/, '');
      const { generateFile } = await import('../services/fileExportService');
      const { buffer, mimeType, filename } = await generateFile(text, format, `${baseName}-${targetLang}`);

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download translation';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Translate text inside an image (OCR + translate + re-render)
   */
  async translateImage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { documentId, targetLanguage, provider, sourceLanguage } = req.body;

      if (!documentId || !targetLanguage) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'documentId and targetLanguage are required',
        });
      }

      const result = await imageTranslationService.translateImage(
        documentId,
        req.user.id,
        targetLanguage,
        provider
      );

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Image translated',
        data: { translationId: result.translationId },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Image translation failed';
      res.status(400).json({
        success: false,
        statusCode: 400,
        message,
      });
    }
  }

  /**
   * Download the translated image file (if this was an image translation)
   */
  async downloadTranslatedImage(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const translation = await translationService.getTranslationById(id);
      if (!translation) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Translation not found',
        });
      }

      if (req.user && translation.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: 'Unauthorized',
        });
      }

      const image = await imageTranslationService.getTranslatedImage(id, req.user!.id);
      if (!image) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'No translated image available',
        });
      }

      const doc = translation.document;
      const baseName = (doc?.filename || 'translated-image').replace(/\.[^.]+$/, '');

      res.setHeader('Content-Type', image.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${baseName}-translated.png"`);
      res.send(image.buffer);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download translated image';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }
}

export const translationController = new TranslationController();
