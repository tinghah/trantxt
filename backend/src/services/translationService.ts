import { AppDataSource } from '../config/database';
import { Translation } from '../models/Translation';
import { Document } from '../models/Document';
import { CONSTANTS } from '../config/constants';
import { translationApiService } from './translationApiService';
import { quotaService } from './quotaService';
import { documentService } from './documentService';

export class TranslationService {
  private translationRepository = AppDataSource.getRepository(Translation);
  private documentRepository = AppDataSource.getRepository(Document);

  /**
   * Create translation request and attempt translation
   */
  async createTranslation(
    documentId: string,
    userId: string,
    sourceLanguage: string,
    targetLanguages: string[],
    outputFormats: string[] = ['pdf'],
    provider?: string
  ): Promise<Translation> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    if (document.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Enforce quota
    await quotaService.enforceQuota(userId, document.pageCount, 100);

    const translation = this.translationRepository.create({
      documentId,
      userId,
      sourceLanguage,
      targetLanguage: targetLanguages[0],
      targetLanguages,
      outputFormats,
      approvalStatus: CONSTANTS.APPROVAL_STATUS.PENDING,
    });

    const saved = await this.translationRepository.save(translation);

    // Attempt translation using provider (or auto-select)
    try {
      const resolvedProvider =
        provider ||
        (await translationApiService.getAvailableProviders(userId))[0] ||
        'deepl';

      // Extract text content from document
      let text = '';
      try {
        const { buffer } = await documentService.readFileBuffer(documentId, userId);
        const extracted = document.metadata?.extractedText;
        if (extracted) {
          text = typeof extracted === 'string' ? extracted : JSON.stringify(extracted);
        } else {
          text = buffer.toString('utf8').replace(/\u0000/g, '').slice(0, 50000);
        }
      } catch {
        text = document.metadata?.textContent || '';
      }

      if (text && text.trim().length > 0) {
        const result = await translationApiService.translate(
          resolvedProvider,
          {
            text: text.slice(0, 50000),
            sourceLanguage,
            targetLanguage: targetLanguages[0],
          },
          userId
        );

        saved.translatedContent = {
          [targetLanguages[0]]: result.translatedText,
          _provider: resolvedProvider,
          _translatedAt: new Date().toISOString(),
        };
        saved.tokensUsed = result.tokensUsed;
        saved.approvalStatus = CONSTANTS.APPROVAL_STATUS.APPROVED;

        await quotaService.updateUsage(userId, document.pageCount, result.tokensUsed, 0, resolvedProvider);
      }
    } catch (error) {
      saved.translatedContent = {
        _error: error instanceof Error ? error.message : 'Translation failed',
      };
      saved.approvalStatus = CONSTANTS.APPROVAL_STATUS.PENDING;
    }

    return await this.translationRepository.save(saved);
  }

  /**
   * Get translation by ID
   */
  async getTranslationById(translationId: string): Promise<Translation | null> {
    return await this.translationRepository.findOne({
      where: { id: translationId },
      relations: ['document', 'user'],
    });
  }

  /**
   * Get user's translations
   */
  async getUserTranslations(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ translations: Translation[]; total: number }> {
    const [translations, total] = await this.translationRepository.findAndCount({
      where: { userId },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['document'],
      order: { createdAt: 'DESC' },
    });

    return { translations, total };
  }

  /**
   * Translate content
   */
  async translateContent(
    translationId: string,
    content: string,
    provider: string,
    userId?: string
  ): Promise<{ translatedContent: string; tokensUsed: number }> {
    const translation = await this.getTranslationById(translationId);
    if (!translation) {
      throw new Error('Translation not found');
    }

    const result = await translationApiService.translate(
      provider,
      {
        text: content,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
      },
      userId
    );

    translation.translatedContent = {
      text: result.translatedText,
      provider,
      translatedAt: new Date(),
    };
    translation.tokensUsed = result.tokensUsed;

    await this.translationRepository.save(translation);

    return {
      translatedContent: result.translatedText,
      tokensUsed: result.tokensUsed,
    };
  }

  /**
   * Approve translation
   */
  async approveTranslation(
    translationId: string,
    adminId: string
  ): Promise<Translation> {
    const translation = await this.getTranslationById(translationId);
    if (!translation) {
      throw new Error('Translation not found');
    }

    translation.approvalStatus = CONSTANTS.APPROVAL_STATUS.APPROVED;
    translation.approvedBy = adminId;
    translation.approvedAt = new Date();

    return await this.translationRepository.save(translation);
  }

  /**
   * Reject translation
   */
  async rejectTranslation(translationId: string, adminId: string): Promise<Translation> {
    const translation = await this.getTranslationById(translationId);
    if (!translation) {
      throw new Error('Translation not found');
    }

    translation.approvalStatus = CONSTANTS.APPROVAL_STATUS.REJECTED;
    translation.approvedBy = adminId;
    translation.approvedAt = new Date();

    return await this.translationRepository.save(translation);
  }

  /**
   * Get pending translations
   */
  async getPendingTranslations(page: number, limit: number): Promise<{
    translations: Translation[];
    total: number;
  }> {
    const [translations, total] = await this.translationRepository.findAndCount({
      where: { approvalStatus: CONSTANTS.APPROVAL_STATUS.PENDING },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['document', 'user'],
      order: { createdAt: 'ASC' },
    });

    return { translations, total };
  }

  /**
   * Increment download count
   */
  async incrementDownloadCount(translationId: string): Promise<void> {
    await this.translationRepository.increment(
      { id: translationId },
      'downloadCount',
      1
    );
  }

  /**
   * Search translations
   */
  async searchTranslations(
    filters: {
      sourceLanguage?: string;
      targetLanguage?: string;
      userId?: string;
      status?: string;
    },
    page: number,
    limit: number
  ): Promise<{ translations: Translation[]; total: number }> {
    let query = this.translationRepository.createQueryBuilder('trans');

    if (filters.sourceLanguage) {
      query = query.where('trans.sourceLanguage = :sourceLanguage', {
        sourceLanguage: filters.sourceLanguage,
      });
    }

    if (filters.targetLanguage) {
      query = query.andWhere('trans.targetLanguage = :targetLanguage', {
        targetLanguage: filters.targetLanguage,
      });
    }

    if (filters.userId) {
      query = query.andWhere('trans.userId = :userId', { userId: filters.userId });
    }

    if (filters.status) {
      query = query.andWhere('trans.approvalStatus = :status', { status: filters.status });
    }

    const total = await query.getCount();

    const translations = await query
      .leftJoinAndSelect('trans.document', 'document')
      .leftJoinAndSelect('trans.user', 'user')
      .orderBy('trans.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { translations, total };
  }
}

export const translationService = new TranslationService();
