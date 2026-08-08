import crypto from 'crypto';
import { env } from '../config/env';
import { CONSTANTS } from '../config/constants';

export class EncryptionService {
  private encryptionKey: Buffer;

  constructor() {
    // Ensure encryption key is 32 bytes (256 bits) for AES-256
    let key = env.ENCRYPTION_KEY;
    if (key.length < 32) {
      key = key.padEnd(32, '0');
    }
    this.encryptionKey = Buffer.from(key.slice(0, 32));
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encryptData(data: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      CONSTANTS.ENCRYPTION_ALGORITHM as any,
      this.encryptionKey,
      iv
    );

    let encrypted = cipher.update(data, 'utf8', CONSTANTS.ENCRYPTION_ENCODING as any);
    encrypted += cipher.final(CONSTANTS.ENCRYPTION_ENCODING as any);

    const authTag = (cipher as any).getAuthTag();
    
    // Combine IV + authTag + encrypted data
    const combined = iv.toString(CONSTANTS.ENCRYPTION_ENCODING as any) +
      ':' + authTag.toString(CONSTANTS.ENCRYPTION_ENCODING as any) +
      ':' + encrypted;

    return combined;
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decryptData(encrypted: string): string {
    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], CONSTANTS.ENCRYPTION_ENCODING as any);
    const authTag = Buffer.from(parts[1], CONSTANTS.ENCRYPTION_ENCODING as any);
    const encryptedData = parts[2];

    const decipher = crypto.createDecipheriv(
      CONSTANTS.ENCRYPTION_ALGORITHM as any,
      this.encryptionKey,
      iv
    );

    (decipher as any).setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, CONSTANTS.ENCRYPTION_ENCODING as any, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate a hash for API keys (one-way)
   */
  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Generate a random encryption key
   */
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt file path
   */
  encryptFilePath(filePath: string): string {
    return this.encryptData(filePath);
  }

  /**
   * Decrypt file path
   */
  decryptFilePath(encryptedPath: string): string {
    return this.decryptData(encryptedPath);
  }
}

export const encryptionService = new EncryptionService();
