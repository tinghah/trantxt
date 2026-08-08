import axios from 'axios';
import { AppDataSource } from '../config/database';
import { TranslationApiKey } from '../models/TranslationApiKey';
import { encryptionService } from './encryptionService';
import { env } from '../config/env';
import { CONSTANTS } from '../config/constants';

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
   * Translate using Google Translate
   */
  async translateWithGoogle(request: TranslationRequest): Promise<TranslationResult> {
    if (!env.GOOGLE_TRANSLATE_API_KEY) {
      throw new Error('Google Translate API key not configured');
    }

    try {
      const response = await axios.post(
        'https://translation.googleapis.com/language/translate/v2',
        {
          q: request.text,
          source_language: request.sourceLanguage,
          target_language: request.targetLanguage,
        },
        {
          params: { key: env.GOOGLE_TRANSLATE_API_KEY },
        }
      );

      return {
        translatedText: response.data.data.translations[0].translatedText,
        tokensUsed: Math.ceil(request.text.length / 100),
      };
    } catch (error) {
      throw new Error(`Google Translate error: ${error}`);
    }
  }

  /**
   * Translate using DeepL
   */
  async translateWithDeepL(request: TranslationRequest): Promise<TranslationResult> {
    if (!env.DEEPL_API_KEY) {
      throw new Error('DeepL API key not configured');
    }

    try {
      const response = await axios.post(
        'https://api-free.deepl.com/v1/translate',
        {
          text: [request.text],
          source_lang: request.sourceLanguage.toUpperCase(),
          target_lang: request.targetLanguage.toUpperCase(),
        },
        {
          headers: {
            Authorization: `DeepL-Auth-Key ${env.DEEPL_API_KEY}`,
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
  async translateWithAzure(request: TranslationRequest): Promise<TranslationResult> {
    if (!env.AZURE_TRANSLATOR_KEY || !env.AZURE_TRANSLATOR_ENDPOINT) {
      throw new Error('Azure Translator not configured');
    }

    try {
      const response = await axios.post(
        `${env.AZURE_TRANSLATOR_ENDPOINT}/translate`,
        [{ text: request.text }],
        {
          params: {
            'api-version': '3.0',
            from: request.sourceLanguage,
            to: request.targetLanguage,
          },
          headers: {
            'Ocp-Apim-Subscription-Key': env.AZURE_TRANSLATOR_KEY,
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
   * Translate with specified provider
   */
  async translate(
    provider: string,
    request: TranslationRequest
  ): Promise<TranslationResult> {
    switch (provider) {
      case CONSTANTS.TRANSLATION_PROVIDERS.GOOGLE:
        return this.translateWithGoogle(request);
      case CONSTANTS.TRANSLATION_PROVIDERS.DEEPL:
        return this.translateWithDeepL(request);
      case CONSTANTS.TRANSLATION_PROVIDERS.AZURE:
        return this.translateWithAzure(request);
      default:
        throw new Error(`Unknown translation provider: ${provider}`);
    }
  }

  /**
   * Store API key (encrypted)
   */
  async storeApiKey(
    provider: string,
    apiKey: string,
    apiSecret: string | undefined,
    adminId: string
  ): Promise<TranslationApiKey> {
    const encryptedKey = encryptionService.encryptData(apiKey);
    const encryptedSecret = apiSecret ? encryptionService.encryptData(apiSecret) : undefined;

    const apiKeyRecord = this.apiKeyRepository.create({
      provider,
      apiKeyEncrypted: encryptedKey,
      apiSecretEncrypted: encryptedSecret,
      createdByAdmin: adminId,
      isActive: true,
    });

    return await this.apiKeyRepository.save(apiKeyRecord);
  }

  /**
   * Get active API keys
   */
  async getActiveApiKeys(): Promise<TranslationApiKey[]> {
    return await this.apiKeyRepository.find({
      where: { isActive: true },
    });
  }

  /**
   * Check provider availability
   */
  async isProviderAvailable(provider: string): Promise<boolean> {
    switch (provider) {
      case CONSTANTS.TRANSLATION_PROVIDERS.GOOGLE:
        return !!env.GOOGLE_TRANSLATE_API_KEY;
      case CONSTANTS.TRANSLATION_PROVIDERS.DEEPL:
        return !!env.DEEPL_API_KEY;
      case CONSTANTS.TRANSLATION_PROVIDERS.AZURE:
        return !!(env.AZURE_TRANSLATOR_KEY && env.AZURE_TRANSLATOR_ENDPOINT);
      default:
        return false;
    }
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<string[]> {
    const providers = [];
    for (const provider of Object.values(CONSTANTS.TRANSLATION_PROVIDERS)) {
      if (await this.isProviderAvailable(provider)) {
        providers.push(provider);
      }
    }
    return providers;
  }
}

export const translationApiService = new TranslationApiService();
