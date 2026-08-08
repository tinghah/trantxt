import { Request, Response } from 'express';
import { translationService } from '../services/translationService';
import { translationApiService } from '../services/translationApiService';
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

      const { documentId, targetLanguages, outputFormat } = req.body;

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
        'en',
        targetLanguages,
        [outputFormat || 'pdf']
      );

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Translation request created',
        data: { translation },
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
        data: { translation },
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
        data: { translations },
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

      await translationService.incrementDownloadCount(id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Translation prepared for download',
        data: { translation },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download translation';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }
}

export const translationController = new TranslationController();
