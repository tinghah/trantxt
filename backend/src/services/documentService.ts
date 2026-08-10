import { AppDataSource } from '../config/database';
import { Document } from '../models/Document';
import { AuditLog } from '../models/AuditLog';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs/promises';
import * as path from 'path';
import { env } from '../config/env';
import { CONSTANTS } from '../config/constants';
import { encryptionService } from './encryptionService';

export class DocumentService {
  private documentRepository = AppDataSource.getRepository(Document);
  private auditRepository = AppDataSource.getRepository(AuditLog);

  /**
   * Create document record
   */
  async createDocument(
    userId: string,
    filename: string,
    originalFormat: string,
    fileSizeBytes: number,
    sourceLanguage?: string,
    pageCount: number = 1,
    metadata: Record<string, any> = {}
  ): Promise<Document> {
    const docId = uuidv4();
    const encryptedPath = encryptionService.encryptFilePath(
      path.join(env.FILE_UPLOAD_DIR, `${docId}.${originalFormat}`)
    );

    const document = this.documentRepository.create({
      id: docId,
      userId,
      filename,
      originalFormat,
      filePath: encryptedPath,
      fileSizeBytes,
      sourceLanguage,
      pageCount,
      hasImages: metadata?.hasImages || false,
      metadata,
      status: CONSTANTS.DOCUMENT_STATUS.PENDING,
    });

    return await this.documentRepository.save(document);
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<Document | null> {
    return await this.documentRepository.findOne({
      where: { id: documentId },
    });
  }

  /**
   * Get user's documents
   */
  async getUserDocuments(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ documents: Document[]; total: number }> {
    const [documents, total] = await this.documentRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { uploadDate: 'DESC' },
    });

    return { documents, total };
  }

  /**
   * Update document status
   */
  async updateStatus(
    documentId: string,
    status: string,
    errorMessage?: string
  ): Promise<Document> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = status;
    if (errorMessage) {
      document.errorMessage = errorMessage;
    }

    return await this.documentRepository.save(document);
  }

  /**
   * Update document metadata
   */
  async updateMetadata(
    documentId: string,
    metadata: Record<string, any>
  ): Promise<Document> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.metadata = { ...document.metadata, ...metadata };
    return await this.documentRepository.save(document);
  }

  /**
   * Save uploaded file
   */
  async saveFile(file: Express.Multer.File, documentId: string): Promise<string> {
    try {
      const uploadDir = env.FILE_UPLOAD_DIR;
      
      // Create directory if it doesn't exist
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, `${documentId}.${file.originalname.split('.').pop()}`);
      await fs.writeFile(filePath, file.buffer);

      return filePath;
    } catch (error) {
      throw new Error(`Failed to save file: ${error}`);
    }
  }

  /**
   * Delete document and associated file
   */
  async deleteDocument(documentId: string, userId: string): Promise<void> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Delete file from storage
    try {
      const filePath = encryptionService.decryptFilePath(document.filePath);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    await this.documentRepository.remove(document);
  }

  /**
   * Get document file path
   */
  getFilePath(document: Document): string {
    return encryptionService.decryptFilePath(document.filePath);
  }

  /**
   * Get user's total storage usage
   */
  async getUserStorageUsage(userId: string): Promise<number> {
    const result = await this.documentRepository
      .createQueryBuilder('doc')
      .select('SUM(doc.fileSizeBytes)', 'total')
      .where('doc.userId = :userId', { userId })
      .getRawOne();

    return result?.total || 0;
  }

  /**
   * Read document file buffer for preview
   */
  async readFileBuffer(documentId: string, userId: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const document = await this.getDocumentById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    if (document.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const filePath = this.getFilePath(document);
    const buffer = await fs.readFile(filePath);

    const mimeMap: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      bmp: 'image/bmp',
      tiff: 'image/tiff',
    };

    return {
      buffer,
      mimeType: mimeMap[document.originalFormat] || 'application/octet-stream',
    };
  }
}

export const documentService = new DocumentService();
