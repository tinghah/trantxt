import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { translationService } from '../services/translationService';
import { auditService } from '../services/auditService';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserGroup } from '../models/UserGroup';
import { Translation } from '../models/Translation';
import { CONSTANTS } from '../config/constants';

export class AdminController {
  private userRepository = AppDataSource.getRepository(User);
  private groupRepository = AppDataSource.getRepository(UserGroup);
  private translationRepository = AppDataSource.getRepository(Translation);

  /**
   * Get all users
   */
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        CONSTANTS.MAX_PAGE_SIZE,
        parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE
      );

      const { users, total } = await userService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Users retrieved',
        data: { users },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get users',
      });
    }
  }

  /**
   * Get user details
   */
  async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User retrieved',
        data: { user },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get user',
      });
    }
  }

  /**
   * Approve user
   */
  async approveUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const user = await userService.approveUser(id, req.user.id, req.ipAddress || '');

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User approved',
        data: { user },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve user';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Assign user to group
   */
  async assignToGroup(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const { groupId } = req.body;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'groupId is required',
        });
      }

      const user = await userService.assignToGroup(id, groupId, req.user.id, req.ipAddress || '');

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User assigned to group',
        data: { user },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to assign user';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Create user group
   */
  async createGroup(req: Request, res: Response) {
    try {
      const { name, description, monthlyPageLimit, fileSizeLimitMb, translationApisAllowed } =
        req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Group name is required',
        });
      }

      const group = this.groupRepository.create({
        name,
        description,
        monthlyPageLimit: monthlyPageLimit || CONSTANTS.DEFAULT_MONTHLY_PAGE_LIMIT,
        fileSizeLimitMb: fileSizeLimitMb || CONSTANTS.DEFAULT_FILE_SIZE_LIMIT_MB,
        translationApisAllowed: translationApisAllowed || ['google', 'deepl'],
      });

      const saved = await this.groupRepository.save(group);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Group created',
        data: { group: saved },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create group';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get all groups
   */
  async getAllGroups(req: Request, res: Response) {
    try {
      const groups = await this.groupRepository.find();

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Groups retrieved',
        data: { groups },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get groups',
      });
    }
  }

  /**
   * Get pending translations
   */
  async getPendingTranslations(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        CONSTANTS.MAX_PAGE_SIZE,
        parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE
      );

      const { translations, total } = await translationService.getPendingTranslations(page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Pending translations retrieved',
        data: { translations },
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get pending translations',
      });
    }
  }

  /**
   * Approve translation
   */
  async approveTranslation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const translation = await translationService.approveTranslation(id, req.user.id);

      await auditService.logAction(
        req.user.id,
        CONSTANTS.AUDIT_ACTIONS.APPROVE,
        CONSTANTS.RESOURCE_TYPES.TRANSLATION,
        id,
        { status: 'approved' },
        req.ipAddress || ''
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Translation approved',
        data: { translation },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve translation';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Reject translation
   */
  async rejectTranslation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const translation = await translationService.rejectTranslation(id, req.user.id);

      await auditService.logAction(
        req.user.id,
        CONSTANTS.AUDIT_ACTIONS.REJECT,
        CONSTANTS.RESOURCE_TYPES.TRANSLATION,
        id,
        { status: 'rejected' },
        req.ipAddress || ''
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Translation rejected',
        data: { translation },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject translation';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get analytics dashboard
   */
  async getDashboard(req: Request, res: Response) {
    try {
      const usersCount = await this.userRepository.count();
      const groupsCount = await this.groupRepository.count();
      const translationsCount = await this.translationRepository.count();

      const recentUsers = await this.userRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Dashboard data retrieved',
        data: {
          stats: {
            totalUsers: usersCount,
            totalGroups: groupsCount,
            totalTranslations: translationsCount,
          },
          recentUsers,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get dashboard data',
      });
    }
  }
}

export const adminController = new AdminController();
