import { AppDataSource } from '../config/database';
import { UsageMetrics } from '../models/UsageMetrics';
import { User } from '../models/User';
import { CONSTANTS } from '../config/constants';

export class QuotaService {
  private metricsRepository = AppDataSource.getRepository(UsageMetrics);
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Get current month in YYYY-MM format
   */
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get or create usage metrics for current month
   */
  private async getOrCreateMetrics(userId: string): Promise<UsageMetrics> {
    const yearMonth = this.getCurrentMonth();
    let metrics = await this.metricsRepository.findOne({
      where: { userId, yearMonth },
    });

    if (!metrics) {
      metrics = this.metricsRepository.create({
        userId,
        yearMonth,
        pagesTranslated: 0,
        tokensUsed: 0,
        filesUploaded: 0,
        totalSizeBytes: 0,
        apiCallsByProvider: {},
      });
      metrics = await this.metricsRepository.save(metrics);
    }

    return metrics;
  }

  /**
   * Check if user has remaining quota
   */
  async checkQuota(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['group'],
    });

    if (!user || !user.group) {
      throw new Error('User or group not found');
    }

    const metrics = await this.getOrCreateMetrics(userId);

    return (
      metrics.pagesTranslated < user.group.monthlyPageLimit &&
      metrics.tokensUsed < user.group.tokenQuota
    );
  }

  /**
   * Get remaining quota
   */
  async getRemainingQuota(userId: string): Promise<{
    pagesRemaining: number;
    tokensRemaining: number;
    pageLimit: number;
    tokenLimit: number;
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['group'],
    });

    if (!user || !user.group) {
      throw new Error('User or group not found');
    }

    const metrics = await this.getOrCreateMetrics(userId);

    return {
      pagesRemaining: Math.max(0, user.group.monthlyPageLimit - metrics.pagesTranslated),
      tokensRemaining: Math.max(0, user.group.tokenQuota - metrics.tokensUsed),
      pageLimit: user.group.monthlyPageLimit,
      tokenLimit: user.group.tokenQuota,
    };
  }

  /**
   * Update usage metrics
   */
  async updateUsage(
    userId: string,
    pages: number,
    tokens: number,
    fileSize: number,
    provider?: string
  ): Promise<void> {
    const metrics = await this.getOrCreateMetrics(userId);

    metrics.pagesTranslated = Number(metrics.pagesTranslated) + pages;
    metrics.tokensUsed = Number(metrics.tokensUsed) + tokens;
    metrics.filesUploaded = Number(metrics.filesUploaded) + 1;
    metrics.totalSizeBytes = Number(metrics.totalSizeBytes) + Number(fileSize);

    if (provider) {
      metrics.apiCallsByProvider[provider] = (metrics.apiCallsByProvider[provider] || 0) + 1;
    }

    metrics.updatedAt = new Date();
    await this.metricsRepository.save(metrics);
  }

  /**
   * Get usage metrics
   */
  async getUsageMetrics(userId: string): Promise<UsageMetrics | null> {
    return await this.getOrCreateMetrics(userId);
  }

  /**
   * Get usage history
   */
  async getUsageHistory(userId: string, months: number = 12): Promise<UsageMetrics[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    return await this.metricsRepository.find({
      where: {
        userId,
      },
      order: { yearMonth: 'DESC' },
      take: months,
    });
  }

  /**
   * Enforce quota limits
   */
  async enforceQuota(
    userId: string,
    requiredPages: number,
    requiredTokens: number
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['group'],
    });

    if (!user || !user.group) {
      throw new Error('User or group not found');
    }

    const metrics = await this.getOrCreateMetrics(userId);

    if (metrics.pagesTranslated + requiredPages > user.group.monthlyPageLimit) {
      throw new Error(
        `Insufficient page quota. Required: ${requiredPages}, Available: ${user.group.monthlyPageLimit - metrics.pagesTranslated}`
      );
    }

    if (metrics.tokensUsed + requiredTokens > user.group.tokenQuota) {
      throw new Error(
        `Insufficient token quota. Required: ${requiredTokens}, Available: ${user.group.tokenQuota - metrics.tokensUsed}`
      );
    }
  }
}

export const quotaService = new QuotaService();
