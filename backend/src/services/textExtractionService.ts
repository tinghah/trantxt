import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Extract readable text from a document file based on its format.
 */
export async function extractTextFromFile(
  filePath: string,
  format: string,
  buffer?: Buffer
): Promise<string> {
  const buf = buffer || await fs.readFile(filePath);
  const ext = format.toLowerCase();

  if (ext === 'txt' || ext === 'md' || ext === 'csv' || ext === 'json' || ext === 'xml' || ext === 'html') {
    return buf.toString('utf-8').replace(/\u0000/g, '').slice(0, 50000);
  }

  if (ext === 'pdf') {
    return extractPdfText(buf);
  }

  if (ext === 'docx' || ext === 'doc') {
    return extractDocxText(buf);
  }

  if (ext === 'epub') {
    return extractEpubText(buf);
  }

  // Images — no extractable text without OCR (handled separately)
  return buf.toString('utf-8').replace(/\u0000/g, '').slice(0, 50000);
}

/**
 * Extract text from a PDF buffer using pdfjs-dist.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdf = await loadingTask.promise;

    const textParts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ')
        .trim();
      if (pageText) {
        textParts.push(pageText);
      }
    }

    return textParts.join('\n\n').slice(0, 50000);
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    return '';
  }
}

/**
 * Extract text from a DOCX buffer using the docx library's internal XML parsing.
 */
async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    // DOCX is a ZIP file. We extract word/document.xml and parse the text.
    const AdmZip = await import('adm-zip').then((m) => m.default);
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    // Find the main document XML
    const docEntry = entries.find(
      (e: any) => e.entryName === 'word/document.xml' || e.entryName.endsWith('/word/document.xml')
    );

    if (!docEntry) return '';

    const xml = docEntry.getData().toString('utf-8');

    // Extract text between <w:t> tags using regex
    const textMatches = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (!textMatches) return '';

    const text = textMatches
      .map((match: string) => match.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    return text.slice(0, 50000);
  } catch (error) {
    console.error('DOCX text extraction failed:', error);
    return '';
  }
}

/**
 * Extract text from an EPUB buffer.
 */
async function extractEpubText(buffer: Buffer): Promise<string> {
  try {
    const AdmZip = await import('adm-zip').then((m) => m.default);
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();

    const htmlFiles = entries.filter(
      (e: any) =>
        e.entryName.endsWith('.html') ||
        e.entryName.endsWith('.xhtml') ||
        e.entryName.endsWith('.htm')
    );

    const textParts: string[] = [];
    for (const entry of htmlFiles) {
      const html = entry.getData().toString('utf-8');
      // Strip HTML tags
      const text = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (text) textParts.push(text);
    }

    return textParts.join('\n\n').slice(0, 50000);
  } catch (error) {
    console.error('EPUB text extraction failed:', error);
    return '';
  }
}
