import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// Noto Sans font paths in Alpine Linux
const NOTO_FONT_DIRS = [
  '/usr/share/fonts/noto',
  '/usr/share/fonts/google-noto-cjk',
  '/usr/share/fonts/noto-cjk',
];

function findFont(name: string): string | null {
  for (const dir of NOTO_FONT_DIRS) {
    const fullPath = path.join(dir, name);
    if (fs.existsSync(fullPath)) return fullPath;
    // Try .ttf extension
    if (fs.existsSync(fullPath + '.ttf')) return fullPath + '.ttf';
  }
  return null;
}

function findCjkFont(): string | null {
  // Look for CJK fonts (covers Chinese, Japanese, Korean)
  const cjkCandidates = [
    'NotoSansCJK-Regular.ttc',
    'NotoSansCJKsc-Regular.otf',
    'NotoSansSC-Regular.otf',
    'NotoSansCJK-Regular.otf',
  ];
  for (const name of cjkCandidates) {
    const found = findFont(name);
    if (found) return found;
  }
  // Try any font in CJK directories
  for (const dir of NOTO_FONT_DIRS) {
    try {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir).filter((f) => f.includes('CJK') && (f.endsWith('.ttf') || f.endsWith('.otf') || f.endsWith('.ttc')));
        if (files.length > 0) return path.join(dir, files[0]);
      }
    } catch {}
  }
  return null;
}

let registeredFont = false;
let registeredCjkFont = false;
let fontName = 'NotoSans';
let cjkFontName = 'NotoSansCJK';

function ensureFont(doc: InstanceType<typeof PDFDocument>) {
  if (registeredFont) return;

  // Register base Noto Sans
  const regular = findFont('NotoSans-Regular');
  if (regular) {
    try {
      doc.registerFont(fontName, regular);
      const bold = findFont('NotoSans-Bold');
      if (bold) doc.registerFont('NotoSansBold', bold);
      registeredFont = true;
    } catch {}
  }

  // Register CJK font
  const cjk = findCjkFont();
  if (cjk) {
    try {
      doc.registerFont(cjkFontName, cjk);
      registeredCjkFont = true;
    } catch {}
  }
}

/**
 * Detect if text contains CJK characters (Chinese, Japanese, Korean).
 */
function containsCjk(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (
      (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
      (code >= 0x3040 && code <= 0x309F) ||   // Hiragana
      (code >= 0x30A0 && code <= 0x30FF) ||   // Katakana
      (code >= 0xAC00 && code <= 0xD7AF) ||   // Hangul
      (code >= 0x3400 && code <= 0x4DBF) ||   // CJK Extension A
      (code >= 0xF900 && code <= 0xFAFF)      // CJK Compatibility Ideographs
    ) return true;
  }
  return false;
}

/**
 * Detect if text contains characters outside basic Latin (ASCII).
 * Returns true if the text needs a Unicode font.
 */
function needsUnicodeFont(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 0x024F) return true; // Beyond extended Latin
  }
  return false;
}

/**
 * Generate a Buffer for a translated text in the requested format.
 */
export const generateFile = async (
  text: string,
  format: string,
  title?: string
): Promise<{ buffer: Buffer; mimeType: string; filename: string }> => {
  switch (format) {
    case 'pdf':
      return generatePdf(text, title);
    case 'docx':
      return generateDocx(text, title);
    default:
      return {
        buffer: Buffer.from(text, 'utf8'),
        mimeType: 'text/plain; charset=utf-8',
        filename: `${title || 'translation'}.txt`,
      };
  }
};

const generatePdf = (text: string, title?: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        resolve({
          buffer: Buffer.concat(chunks),
          mimeType: 'application/pdf',
          filename: `${title || 'translation'}.pdf`,
        });
      });
      doc.on('error', reject);

      // Register Unicode font if available
      ensureFont(doc);
      const fullText = (text || '') + (title || '');
      const hasCjk = registeredCjkFont && containsCjk(fullText);
      const hasUnicode = (registeredFont || registeredCjkFont) && needsUnicodeFont(fullText);
      const useNoto = hasCjk || hasUnicode;

      if (title) {
        doc.fontSize(18);
        if (hasCjk) doc.font(cjkFontName);
        else if (useNoto) doc.font('NotoSansBold');
        doc.text(title, { align: 'center' });
        doc.moveDown();
      }

      doc.fontSize(12);
      if (hasCjk) doc.font(cjkFontName);
      else if (useNoto) doc.font(fontName);
      doc.text(text || '');
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const generateDocx = async (text: string, title?: string): Promise<{ buffer: Buffer; mimeType: string; filename: string }> => {
  const children: Paragraph[] = [];
  if (title) {
    children.push(new Paragraph({ children: [new TextRun({ text: title, bold: true, size: 32 })], spacing: { after: 300 } }));
  }
  const lines = (text || '').split('\n');
  for (const line of lines) {
    children.push(new Paragraph({ children: [new TextRun({ text: line, size: 22 })], spacing: { after: 120 } }));
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
  const buffer = await Packer.toBuffer(doc);
  return {
    buffer: buffer as Buffer,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filename: `${title || 'translation'}.docx`,
  };
};
