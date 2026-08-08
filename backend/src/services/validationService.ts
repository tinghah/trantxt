import { CONSTANTS } from '../config/constants';

export class ValidationService {
  /**
   * Validate file type
   */
  static isValidFileType(filename: string): boolean {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    return CONSTANTS.ALLOWED_FILE_TYPES.includes(ext);
  }

  /**
   * Validate file size
   */
  static isValidFileSize(sizeBytes: number): boolean {
    return sizeBytes <= CONSTANTS.MAX_FILE_SIZE_BYTES;
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate language code (ISO 639-1)
   */
  static isValidLanguageCode(code: string): boolean {
    const languageCodeRegex = /^[a-z]{2}(-[a-z]{2})?$/i;
    return languageCodeRegex.test(code);
  }

  /**
   * Validate pagination parameters
   */
  static isValidPagination(page: number, limit: number): boolean {
    return (
      Number.isInteger(page) &&
      Number.isInteger(limit) &&
      page >= 1 &&
      limit >= 1 &&
      limit <= CONSTANTS.MAX_PAGE_SIZE
    );
  }

  /**
   * Sanitize filename
   */
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 255);
  }

  /**
   * Validate IP address
   */
  static isValidIpAddress(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ip);
  }
}

export const validationService = new ValidationService();
