import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Language } from '../models/Language';
import { TranslationApiKey } from '../models/TranslationApiKey';
import { encryptionService } from '../services/encryptionService';
import { CONSTANTS } from '../config/constants';
import { env } from '../config/env';
import { IsNull } from 'typeorm';

export class ConfigController {
  private languageRepository = AppDataSource.getRepository(Language);
  private apiKeyRepository = AppDataSource.getRepository(TranslationApiKey);

  /**
   * Get enabled languages (for users - translation target list)
   */
  async getEnabledLanguages(req: Request, res: Response) {
    try {
      const languages = await this.languageRepository.find({
        where: { isEnabled: true },
        order: { sortOrder: 'ASC' },
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Languages retrieved',
        data: languages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get languages',
      });
    }
  }

  /**
   * Get all languages (admin)
   */
  async getAllLanguages(req: Request, res: Response) {
    try {
      const languages = await this.languageRepository.find({
        order: { sortOrder: 'ASC' },
      });

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'All languages retrieved',
        data: languages,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get languages',
      });
    }
  }

  /**
   * Enable/disable a language (admin)
   */
  async updateLanguage(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const { isEnabled } = req.body;

      const language = await this.languageRepository.findOne({ where: { code } });
      if (!language) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Language not found',
        });
      }

      if (isEnabled !== undefined) {
        language.isEnabled = !!isEnabled;
      }
      if (req.body.sortOrder !== undefined) {
        language.sortOrder = parseInt(req.body.sortOrder, 10);
      }

      const saved = await this.languageRepository.save(language);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Language updated',
        data: saved,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update language';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Get server-side API keys (admin)
   */
  async getServerApiKeys(req: Request, res: Response) {
    try {
      const keys = await this.apiKeyRepository.find({
        where: { userId: IsNull() },
        order: { createdAt: 'DESC' },
      });

      const safeKeys = keys.map((k) => ({
        id: k.id,
        provider: k.provider,
        name: k.name || '',
        isActive: k.isActive,
        createdAt: k.createdAt,
        keyMasked: this.maskKey(k.apiKeyEncrypted),
      }));

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Server API keys retrieved',
        data: safeKeys,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get API keys',
      });
    }
  }

  /**
   * Add server-side API key (admin)
   */
  async addServerApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { provider, apiKey, apiSecret, name } = req.body;

      if (!provider || !apiKey) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Provider and API key are required',
        });
      }

      const encryptedKey = encryptionService.encryptData(apiKey);
      const encryptedSecret = apiSecret ? encryptionService.encryptData(apiSecret) : undefined;

      const record = this.apiKeyRepository.create({
        provider,
        name: name || provider,
        apiKeyEncrypted: encryptedKey,
        apiSecretEncrypted: encryptedSecret,
        userId: undefined,
        createdByAdmin: req.user.id,
        isActive: true,
      });

      const saved = await this.apiKeyRepository.save(record);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'Server API key added',
        data: {
          id: saved.id,
          provider: saved.provider,
          name: saved.name,
          isActive: saved.isActive,
          createdAt: saved.createdAt,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add API key';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Delete server-side API key (admin)
   */
  async deleteServerApiKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const key = await this.apiKeyRepository.findOne({ where: { id, userId: IsNull() } });

      if (!key) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'API key not found',
        });
      }

      await this.apiKeyRepository.remove(key);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'API key deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to delete API key',
      });
    }
  }

  /**
   * Toggle server API key active status (admin)
   */
  async toggleServerApiKey(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const key = await this.apiKeyRepository.findOne({ where: { id, userId: IsNull() } });
      if (!key) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'API key not found',
        });
      }

      key.isActive = isActive !== undefined ? !!isActive : key.isActive;
      const saved = await this.apiKeyRepository.save(key);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'API key updated',
        data: {
          id: saved.id,
          isActive: saved.isActive,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to update API key',
      });
    }
  }

  /**
   * Get user's own API keys (BYOK)
   */
  async getUserApiKeys(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const keys = await this.apiKeyRepository.find({
        where: { userId: req.user.id },
        order: { createdAt: 'DESC' },
      });

      const safeKeys = keys.map((k) => ({
        id: k.id,
        provider: k.provider,
        name: k.name || '',
        isActive: k.isActive,
        createdAt: k.createdAt,
        keyMasked: this.maskKey(k.apiKeyEncrypted),
      }));

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'User API keys retrieved',
        data: safeKeys,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get API keys',
      });
    }
  }

  /**
   * Add user's own API key (BYOK)
   */
  async addUserApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { provider, apiKey, apiSecret, name } = req.body;

      if (!provider || !apiKey) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Provider and API key are required',
        });
      }

      const encryptedKey = encryptionService.encryptData(apiKey);
      const encryptedSecret = apiSecret ? encryptionService.encryptData(apiSecret) : undefined;

      const record = this.apiKeyRepository.create({
        provider,
        name: name || provider,
        apiKeyEncrypted: encryptedKey,
        apiSecretEncrypted: encryptedSecret,
        userId: req.user.id,
        isActive: true,
      });

      const saved = await this.apiKeyRepository.save(record);

      res.status(201).json({
        success: true,
        statusCode: 201,
        message: 'API key added',
        data: {
          id: saved.id,
          provider: saved.provider,
          name: saved.name,
          isActive: saved.isActive,
          createdAt: saved.createdAt,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add API key';
      res.status(500).json({
        success: false,
        statusCode: 500,
        message,
      });
    }
  }

  /**
   * Delete user's own API key (BYOK)
   */
  async deleteUserApiKey(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
        });
      }

      const { id } = req.params;
      const key = await this.apiKeyRepository.findOne({ where: { id, userId: req.user.id } });

      if (!key) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'API key not found',
        });
      }

      await this.apiKeyRepository.remove(key);

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'API key deleted',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to delete API key',
      });
    }
  }

  /**
   * Get available translation providers
   */
  async getAvailableProviders(req: Request, res: Response) {
    try {
      const providers: any[] = [];

      const providerDefinitions = [
        { id: 'google', name: 'Google Translate', configured: !!env.GOOGLE_TRANSLATE_API_KEY },
        { id: 'deepl', name: 'DeepL', configured: !!env.DEEPL_API_KEY },
        { id: 'azure', name: 'Azure Translator', configured: !!(env.AZURE_TRANSLATOR_KEY && env.AZURE_TRANSLATOR_ENDPOINT) },
      ];

      const serverKeys = await this.apiKeyRepository.find({ where: { userId: IsNull() } });
      const dbProviders = new Set(serverKeys.map((k) => k.provider));

      for (const def of providerDefinitions) {
        const hasServerKey = dbProviders.has(def.id);
        const hasEnvKey = def.configured;
        providers.push({
          ...def,
          serverKeyConfigured: hasServerKey || hasEnvKey,
        });
      }

      // Always include "free" (server-side keys) option
      const freeAvailable = providerDefinitions.some(
        (d) => d.configured || dbProviders.has(d.id)
      );

      res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Providers retrieved',
        data: {
          providers,
          freeAvailable,
          serverConfigured: freeAvailable,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        statusCode: 500,
        message: 'Failed to get providers',
      });
    }
  }

  /**
   * Mask an encrypted key for display (last 4 chars of decrypted value)
   */
  private maskKey(encrypted: string): string {
    try {
      const decrypted = encryptionService.decryptData(encrypted);
      const len = decrypted.length;
      if (len <= 4) return '****';
      return `${decrypted.slice(0, 4)}...${decrypted.slice(-4)}`;
    } catch {
      return '****';
    }
  }
}

export const configController = new ConfigController();
