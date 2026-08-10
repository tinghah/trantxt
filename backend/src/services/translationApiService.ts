import axios from 'axios';
import { AppDataSource } from '../config/database';
import { TranslationApiKey } from '../models/TranslationApiKey';
import { encryptionService } from './encryptionService';
import { env } from '../config/env';
import { CONSTANTS } from '../config/constants';
import { IsNull } from 'typeorm';

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResult {
  translatedText: string;
  tokensUsed: number;
}

export class TranslationApiService {
  private apiKeyRepository = AppDataSource.getRepository(TranslationApiKey);

  /**
   * Resolve API key for a provider:
   * 1. User's own key (BYOK) if provided
   * 2. Server-side key from DB
   * 3. Environment variable fallback
   */
  private async resolveApiKey(
    provider: string,
    userId?: string
  ): Promise<{ apiKey: string; apiSecret?: string; projectId?: string } | null> {
    // 1. User's own key
    if (userId) {
      const userKey = await this.apiKeyRepository.findOne({
        where: { provider, userId, isActive: true },
      });
      if (userKey) {
        return {
          apiKey: encryptionService.decryptData(userKey.apiKeyEncrypted),
          apiSecret: userKey.apiSecretEncrypted
            ? encryptionService.decryptData(userKey.apiSecretEncrypted)
            : undefined,
          projectId: userKey.metadata?.projectId,
        };
      }
    }

    // 2. Server-side key from DB (prefer default key first)
    let serverKey = await this.apiKeyRepository.findOne({
      where: { provider, userId: IsNull(), isActive: true, isDefault: true },
    });
    if (!serverKey) {
      serverKey = await this.apiKeyRepository.findOne({
        where: { provider, userId: IsNull(), isActive: true },
      });
    }
    if (serverKey) {
      return {
        apiKey: encryptionService.decryptData(serverKey.apiKeyEncrypted),
        apiSecret: serverKey.apiSecretEncrypted
          ? encryptionService.decryptData(serverKey.apiSecretEncrypted)
          : undefined,
        projectId: serverKey.metadata?.projectId,
      };
    }

    // 3. Environment variable fallback
    if (provider === CONSTANTS.TRANSLATION_PROVIDERS.GOOGLE && env.GOOGLE_TRANSLATE_API_KEY) {
      return { apiKey: env.GOOGLE_TRANSLATE_API_KEY };
    }
    if (provider === CONSTANTS.TRANSLATION_PROVIDERS.DEEPL && env.DEEPL_API_KEY) {
      return { apiKey: env.DEEPL_API_KEY };
    }
    if (provider === CONSTANTS.TRANSLATION_PROVIDERS.AZURE && env.AZURE_TRANSLATOR_KEY) {
      return {
        apiKey: env.AZURE_TRANSLATOR_KEY,
        apiSecret: env.AZURE_TRANSLATOR_ENDPOINT,
      };
    }

    return null;
  }

  /**
   * Translate using Google Translate
   * Supports both API key auth and OAuth access token auth
   */
  async translateWithGoogle(
    request: TranslationRequest,
    apiKey: string,
    apiSecret?: string,
    projectId?: string
  ): Promise<TranslationResult> {
    let authConfig: Record<string, any> = { params: { key: apiKey } };

    // If the "apiKey" is actually an OAuth client ID (contains .apps.googleusercontent.com),
    // exchange client credentials for an access token
    if (apiKey.includes('apps.googleusercontent.com') && apiSecret) {
      try {
        const tokenResponse = await axios.post(
          'https://oauth2.googleapis.com/token',
          `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const accessToken = tokenResponse.data.access_token;
        authConfig = { headers: { Authorization: `Bearer ${accessToken}` } };
      } catch (error) {
        throw new Error(
          `Google OAuth token exchange failed: ${this.getErrorMessage(error)}. OAuth client credentials cannot be used directly — create an API key in Google Cloud Console (APIs & Services → Credentials → Create API Key) or add a service account key.`
        );
      }
    }

    try {
      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        {
          q: request.text,
          source: request.sourceLanguage === 'auto' || request.sourceLanguage === 'xx' ? undefined : request.sourceLanguage,
          target: request.targetLanguage,
        },
        authConfig
      );

      return {
        translatedText: response.data.data.translations[0].translatedText,
        tokensUsed: Math.ceil(request.text.length / 100),
      };
    } catch (error) {
      throw new Error(`Google Translate error: ${this.getErrorMessage(error)}`);
    }
  }

  /**
   * Extract a readable message from an axios error
   */
  private getErrorMessage(error: any): string {
    if (error?.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error?.response?.data?.error_description) {
      return error.response.data.error_description;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Translate using DeepL
   */
  async translateWithDeepL(request: TranslationRequest, apiKey: string): Promise<TranslationResult> {
    try {
      const isAuto = request.sourceLanguage === 'auto' || request.sourceLanguage === 'xx';
      const body: any = {
        text: [request.text],
        target_lang: request.targetLanguage.toUpperCase(),
      };
      if (!isAuto) {
        body.source_lang = request.sourceLanguage.toUpperCase();
      }

      const response = await axios.post(
        'https://api-free.deepl.com/v1/translate',
        body,
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${apiKey}`,
          },
        }
      );

      return {
        translatedText: response.data.translations[0].text,
        tokensUsed: Math.ceil(request.text.length / 50),
      };
    } catch (error) {
      throw new Error(`DeepL translation error: ${error}`);
    }
  }

  /**
   * Translate using Azure
   */
  async translateWithAzure(
    request: TranslationRequest,
    apiKey: string,
    endpoint: string
  ): Promise<TranslationResult> {
    try {
      const isAuto = request.sourceLanguage === 'auto' || request.sourceLanguage === 'xx';
      const params: any = {
        'api-version': '3.0',
        to: request.targetLanguage,
      };
      if (!isAuto) {
        params.from = request.sourceLanguage;
      }

      const response = await axios.post(
        `${endpoint}/translate`,
        [{ text: request.text }],
        {
          params,
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        translatedText: response.data[0].translations[0].text,
        tokensUsed: Math.ceil(request.text.length / 75),
      };
    } catch (error) {
      throw new Error(`Azure Translator error: ${error}`);
    }
  }

  /**
   * Translate with specified provider, using user key (BYOK) or server key
   */
  async translate(
    provider: string,
    request: TranslationRequest,
    userId?: string
  ): Promise<TranslationResult> {
    const resolved = await this.resolveApiKey(provider, userId);

    if (!resolved) {
      throw new Error(
        `No API key available for provider "${provider}". Please add your own key in Settings or ask an admin to configure a server key.`
      );
    }

    switch (provider) {
      case CONSTANTS.TRANSLATION_PROVIDERS.GOOGLE:
        return this.translateWithGoogle(request, resolved.apiKey, resolved.apiSecret, resolved.projectId);
      case CONSTANTS.TRANSLATION_PROVIDERS.DEEPL:
        return this.translateWithDeepL(request, resolved.apiKey);
      case CONSTANTS.TRANSLATION_PROVIDERS.AZURE:
        return this.translateWithAzure(
          request,
          resolved.apiKey,
          resolved.apiSecret || env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com'
        );
      default:
        throw new Error(`Unknown translation provider: ${provider}`);
    }
  }

  /**
   * Check if a provider has any key available (env, server key, or user key)
   */
  async isProviderAvailable(provider: string, userId?: string): Promise<boolean> {
    const resolved = await this.resolveApiKey(provider, userId);
    return !!resolved;
  }

  /**
   * Get available providers (that have a key configured)
   */
  async getAvailableProviders(userId?: string): Promise<string[]> {
    const providers = [];
    for (const provider of Object.values(CONSTANTS.TRANSLATION_PROVIDERS)) {
      if (await this.isProviderAvailable(provider, userId)) {
        providers.push(provider);
      }
    }
    return providers;
  }

  /**
   * Store API key (encrypted) - supports server keys (userId null) and user keys
   */
  async storeApiKey(
    provider: string,
    apiKey: string,
    apiSecret: string | undefined,
    adminId: string,
    userId?: string
  ): Promise<TranslationApiKey> {
    const encryptedKey = encryptionService.encryptData(apiKey);
    const encryptedSecret = apiSecret ? encryptionService.encryptData(apiSecret) : undefined;

    const apiKeyRecord = this.apiKeyRepository.create({
      provider,
      apiKeyEncrypted: encryptedKey,
      apiSecretEncrypted: encryptedSecret,
      createdByAdmin: adminId,
      userId: userId || undefined,
      isActive: true,
    });

    return await this.apiKeyRepository.save(apiKeyRecord);
  }
}

export const translationApiService = new TranslationApiService();
