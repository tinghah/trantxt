import { Request, Response } from 'express';
import { documentService } from '../services/documentService';
import { quotaService } from '../services/quotaService';
import { CONSTANTS } from '../config/constants';
import { ValidationService } from '../services/validationService';

export class DocumentController {
  /**
   * Upload documents
   */
  async uploadDocuments(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'No files provided',
        });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedDocs = [];

      for (const file of files) {
        // Validate file type
        if (!ValidationService.isValidFileType(file.originalname)) {
          continue;
        }

        // Validate file size
        if (!ValidationService.isValidFileSize(file.size)) {
          continue;
        }

        // Create document record
        const doc = await documentService.createDocument(
          req.user.id,
          ValidationService.sanitizeFilename(file.originalname),
          file.originalname.split('.').pop() || '',
          file.size,
          undefined,
          1,
          { uploadedAt: new Date(), mimeType: file.mimetype }
        );

        // Save file
        await documentService.saveFile(file, doc.id);

        uploadedDocs.push({
          id: doc.id,
          filename: doc.filename,
          size: doc.fileSizeBytes,
          status: doc.status,
        });

        // Update usage metrics
        await quotaService.updateUsage(req.user.id, 1, 0, file.size);
      }

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: `${uploadedDocs.length} document(s) uploaded`,
        data: { documents: uploadedDocs },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get user's documents
   */
  async getDocuments(req: Request, res: Response) {
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

      const { documents, total } = await documentService.getUserDocuments(req.user.id, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Documents retrieved',
        data: documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get documents';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get document details
   */
  async getDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const document = await documentService.getDocumentById(id);
      if (!document || document.userId !== req.user.id) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Document not found',
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Document retrieved',
        data: { document },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get document';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;

      await documentService.deleteDocument(id, req.user.id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Document deleted',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete document';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Preview document (return file data for browser rendering)
   */
  async previewDocument(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;

      const { buffer, mimeType } = await documentService.readFileBuffer(id, req.user.id);

      const isImage = mimeType.startsWith('image/');
      const dataUrl = isImage ? `data:${mimeType};base64,${buffer.toString('base64')}` : null;

      const document = await documentService.getDocumentById(id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Document preview ready',
        data: {
          document: {
            id: document?.id,
            filename: document?.filename,
            originalFormat: document?.originalFormat,
            fileSizeBytes: document?.fileSizeBytes,
            pageCount: document?.pageCount,
            status: document?.status,
            uploadDate: document?.uploadDate,
            metadata: document?.metadata,
          },
          mimeType,
          isImage,
          dataUrl: isImage ? dataUrl : null,
          contentPreview: isImage
            ? null
            : buffer.toString('utf8').slice(0, 5000),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to preview document';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }
}

export const documentController = new DocumentController();
