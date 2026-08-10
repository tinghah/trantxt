import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { translationService } from '../services/translationService';
import { auditService } from '../services/auditService';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { UserGroup } from '../models/UserGroup';
import { Document } from '../models/Document';
import { Translation } from '../models/Translation';
import { UsageMetrics } from '../models/UsageMetrics';
import { AuditLog } from '../models/AuditLog';
import { CONSTANTS } from '../config/constants';

export class AdminController {
  private userRepository = AppDataSource.getRepository(User);
  private groupRepository = AppDataSource.getRepository(UserGroup);
  private documentRepository = AppDataSource.getRepository(Document);
  private translationRepository = AppDataSource.getRepository(Translation);
  private usageMetricsRepository = AppDataSource.getRepository(UsageMetrics);
  private auditRepository = AppDataSource.getRepository(AuditLog);

  /**
   * Sanitize user object (remove sensitive fields)
   */
  private sanitizeUser(user: User): any {
    if (!user) return user;
    const { passwordHash, apiKey, apiKeyHash, ...safeUser } = user as any;
    return safeUser;
  }

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
      const safeUsers = users.map((u) => this.sanitizeUser(u));

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Users retrieved',
        data: safeUsers,
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
        data: { user: this.sanitizeUser(user) },
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
        data: { user: this.sanitizeUser(user) },
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
        data: { user: this.sanitizeUser(user) },
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
      const {
        name,
        description,
        monthlyPageLimit,
        fileSizeLimitMb,
        concurrentUploads,
        tokenQuota,
        translationApisAllowed,
      } = req.body;

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
        concurrentUploads: concurrentUploads || CONSTANTS.DEFAULT_CONCURRENT_UPLOADS,
        tokenQuota: tokenQuota || CONSTANTS.DEFAULT_TOKEN_QUOTA,
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
        data: groups,
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
        data: translations,
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
      const totalUsers = await this.userRepository.count();
      const totalGroups = await this.groupRepository.count();
      const totalDocuments = await this.documentRepository.count();
      const totalTranslations = await this.translationRepository.count();
      const activeUsers = await this.userRepository.count({ where: { isApproved: true } });

      const usageAgg = await this.usageMetricsRepository
        .createQueryBuilder('u')
        .select('COALESCE(SUM(u.pagesTranslated), 0)', 'pages')
        .addSelect('COALESCE(SUM(u.tokensUsed), 0)', 'tokens')
        .addSelect('COALESCE(SUM(u.totalSizeBytes), 0)', 'storage')
        .getRawOne();

      const recentUsers = await this.userRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Dashboard data retrieved',
        data: {
          totalUsers,
          totalGroups,
          totalDocuments,
          totalTranslations,
          activeUsers,
          pagesProcessed: parseInt(usageAgg?.pages || '0', 10),
          tokensUsed: parseInt(usageAgg?.tokens || '0', 10),
          totalStorage: parseInt(usageAgg?.storage || '0', 10),
          recentUsers: recentUsers.map((u) => this.sanitizeUser(u)),
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

  /**
   * Get all translations (paginated)
   */
  async getAllTranslations(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        CONSTANTS.MAX_PAGE_SIZE,
        parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE
      );

      const { translations, total } = await translationService.searchTranslations({}, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Translations retrieved',
        data: translations,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get translations',
      });
    }
  }

  /**
   * Get audit logs (paginated)
   */
  async getAuditLogs(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        CONSTANTS.MAX_PAGE_SIZE,
        parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE
      );

      const [logs, total] = await this.auditRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { timestamp: 'DESC' },
        relations: ['user'],
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Audit logs retrieved',
        data: logs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get audit logs',
      });
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        CONSTANTS.MAX_PAGE_SIZE,
        parseInt(req.query.limit as string) || CONSTANTS.DEFAULT_PAGE_SIZE
      );

      const { logs, total } = await auditService.getUserAuditLogs(id, page, limit);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User audit logs retrieved',
        data: logs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get user audit logs',
      });
    }
  }

  /**
   * Update user status (activate/deactivate)
   */
  async updateUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const user = await userService.getUserById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'User not found',
        });
      }

      user.isApproved = isApproved !== undefined ? !!isApproved : user.isApproved;
      const saved = await this.userRepository.save(user);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User status updated',
        data: { user: this.sanitizeUser(saved) },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update user status';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      await userService.deleteUser(id, req.user.id, req.ipAddress || '');

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User deleted',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete user';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get group by ID
   */
  async getGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const group = await this.groupRepository.findOne({ where: { id } });

      if (!group) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Group not found',
        });
      }

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Group retrieved',
        data: { group },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get group',
      });
    }
  }

  /**
   * Get group members
   */
  async getGroupMembers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const members = await this.userRepository.find({
        where: { groupId: id },
        order: { createdAt: 'DESC' },
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Group members retrieved',
        data: { members: members.map((m) => this.sanitizeUser(m)) },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get group members',
      });
    }
  }

  /**
   * Update group
   */
  async updateGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const group = await this.groupRepository.findOne({ where: { id } });
      if (!group) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Group not found',
        });
      }

      Object.assign(group, updates);
      const saved = await this.groupRepository.save(group);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Group updated',
        data: { group: saved },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update group';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Delete group
   */
  async deleteGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const group = await this.groupRepository.findOne({ where: { id } });
      if (!group) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Group not found',
        });
      }

      await this.groupRepository.remove(group);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Group deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to delete group',
      });
    }
  }
}

export const adminController = new AdminController();
