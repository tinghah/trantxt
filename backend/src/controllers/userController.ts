import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { quotaService } from '../services/quotaService';
import { auditService } from '../services/auditService';
import { translationService } from '../services/translationService';
import { CONSTANTS } from '../config/constants';

export class UserController {
  /**
   * Get user profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const user = await userService.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'User not found',
        });
      }

      const quota = await quotaService.getRemainingQuota(req.user.id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User profile retrieved',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
            isApproved: user.isApproved,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            group: user.group,
          },
          quota,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get profile';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Update profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { name } = req.body;

      const updated = await userService.updateProfile(
        req.user.id,
        { name },
        req.ipAddress || ''
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Profile updated',
        data: {
          user: {
            id: updated.id,
            email: updated.email,
            name: updated.name,
          },
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get usage metrics
   */
  async getUsage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const metrics = await quotaService.getUsageMetrics(req.user.id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Usage metrics retrieved',
        data: metrics,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get usage';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get quota
   */
  async getQuota(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const quota = await quotaService.getRemainingQuota(req.user.id);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Quota retrieved',
        data: { quota },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get quota';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get translation history
   */
  async getHistory(req: Request, res: Response) {
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
        message: 'Translation history retrieved',
        data: translations.map((t) => translationService.serializeTranslation(t)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get history';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }
}

export const userController = new UserController();
