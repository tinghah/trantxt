import { AppDataSource } from '../config/database';
import { AuditLog } from '../models/AuditLog';
import { CONSTANTS } from '../config/constants';

export class AuditService {
  private auditRepository = AppDataSource.getRepository(AuditLog);

  /**
   * Log an action
   */
  async logAction(
    userId: string | undefined,
    action: string,
    resourceType: string,
    resourceId: string,
    changes: Record<string, any>,
    ipAddress: string,
    status: string = 'success'
  ): Promise<AuditLog> {
    const auditLog = this.auditRepository.create({
      userId,
      action,
      resourceType,
      resourceId,
      changes,
      ipAddress,
      status,
    });

    return await this.auditRepository.save(auditLog);
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await this.auditRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      order: { timestamp: 'DESC' },
    });

    return { logs, total };
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(
    filters: {
      userId?: string;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    },
    page: number,
    limit: number
  ): Promise<{ logs: AuditLog[]; total: number }> {
    let query = this.auditRepository.createQueryBuilder('log');

    if (filters.userId) {
      query = query.where('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      query = query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.resourceType) {
      query = query.andWhere('log.resourceType = :resourceType', {
        resourceType: filters.resourceType,
      });
    }

    if (filters.startDate) {
      query = query.andWhere('log.timestamp >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      query = query.andWhere('log.timestamp <= :endDate', { endDate: filters.endDate });
    }

    const total = await query.getCount();

    const logs = await query
      .orderBy('log.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { logs, total };
  }

  /**
   * Get activity summary
   */
  async getActivitySummary(
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, number>> {
    const logs = await this.auditRepository
      .createQueryBuilder('log')
      .select('log.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('log.timestamp >= :startDate', { startDate })
      .andWhere('log.timestamp <= :endDate', { endDate })
      .groupBy('log.action')
      .getRawMany();

    const summary: Record<string, number> = {};
    logs.forEach((log) => {
      summary[log.action] = parseInt(log.count, 10);
    });

    return summary;
  }

  /**
   * Get user's action count
   */
  async getUserActionCount(userId: string, action: string): Promise<number> {
    return await this.auditRepository.count({
      where: { userId, action },
    });
  }
}

export const auditService = new AuditService();
