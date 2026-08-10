import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun } from 'docx';

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

      if (title) {
        doc.fontSize(18).text(title, { align: 'center' });
        doc.moveDown();
      }
      doc.fontSize(12);
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
