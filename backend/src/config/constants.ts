export const CONSTANTS = {
  // File constraints
  ALLOWED_FILE_TYPES: ['pdf', 'docx', 'txt', 'md', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'],
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024, // 50MB
  
  // Rate limiting (requests per minute)
  GLOBAL_RATE_LIMIT: 100,
  PER_USER_RATE_LIMIT: 50,
  UPLOAD_RATE_LIMIT: 10,
  TRANSLATION_RATE_LIMIT: 5,
  
  // Default quotas
  DEFAULT_MONTHLY_PAGE_LIMIT: 100,
  DEFAULT_FILE_SIZE_LIMIT_MB: 50,
  DEFAULT_CONCURRENT_UPLOADS: 5,
  DEFAULT_TOKEN_QUOTA: 10000,
  
  // JWT
  JWT_ALGORITHM: 'HS256',
  
  // Document statuses
  DOCUMENT_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  
  // Translation statuses
  TRANSLATION_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  
  // Translation approval statuses
  APPROVAL_STATUS: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
  },
  
  // Audit action types
  AUDIT_ACTIONS: {
    UPLOAD: 'upload',
    TRANSLATE: 'translate',
    DOWNLOAD: 'download',
    APPROVE: 'approve',
    REJECT: 'reject',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    UPDATE_PROFILE: 'update_profile',
    CREATE_USER: 'create_user',
    UPDATE_USER: 'update_user',
    DELETE_USER: 'delete_user',
    CREATE_GROUP: 'create_group',
    UPDATE_GROUP: 'update_group',
    DELETE_GROUP: 'delete_group',
  },
  
  // Resource types for audit
  RESOURCE_TYPES: {
    DOCUMENT: 'document',
    TRANSLATION: 'translation',
    USER: 'user',
    GROUP: 'group',
  },
  
  // Translation providers
  TRANSLATION_PROVIDERS: {
    GOOGLE: 'google',
    DEEPL: 'deepl',
    AZURE: 'azure',
  },
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Encryption
  ENCRYPTION_ALGORITHM: 'aes-256-gcm',
  ENCRYPTION_ENCODING: 'hex',
  AUTH_TAG_LENGTH: 16,
};
