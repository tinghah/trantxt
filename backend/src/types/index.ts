export interface IUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  lastLogin?: Date;
  isAdmin: boolean;
  isApproved: boolean;
  groupId?: string;
  apiKey?: string;
  apiKeyHash?: string;
}

export interface IUserGroup {
  id: string;
  name: string;
  description: string;
  monthlyPageLimit: number;
  fileSizeLimitMb: number;
  concurrentUploads: number;
  tokenQuota: number;
  translationApisAllowed: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDocument {
  id: string;
  userId: string;
  filename: string;
  originalFormat: string;
  filePath: string;
  fileSizeBytes: number;
  uploadDate: Date;
  status: string;
  sourceLanguage?: string;
  pageCount: number;
  hasImages: boolean;
  metadata: Record<string, any>;
  errorMessage?: string;
}

export interface ITranslation {
  id: string;
  documentId: string;
  userId: string;
  sourceLanguage: string;
  targetLanguage: string;
  targetLanguages: string[];
  originalContent: Record<string, any>;
  translatedContent: Record<string, any>;
  tokensUsed: number;
  createdAt: Date;
  outputFormats: string[];
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: Date;
  downloadCount: number;
}

export interface IUsageMetrics {
  id: string;
  userId: string;
  yearMonth: string;
  pagesTranslated: number;
  tokensUsed: number;
  filesUploaded: number;
  totalSizeBytes: number;
  apiCallsByProvider: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  timestamp: Date;
  status: string;
}

export interface ITranslationApiKey {
  id: string;
  provider: string;
  apiKeyEncrypted: string;
  apiSecretEncrypted?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdByAdmin: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

export interface FileMetadata {
  textBlocks: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    color: string;
  }>;
  images: Array<{
    path: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  pageCount: number;
  language: string;
}

export interface TranslationRequest {
  documentId: string;
  targetLanguages: string[];
  outputFormat: string;
  priority: 'low' | 'normal' | 'high';
  requestApproval: boolean;
}

export interface TranslationResponse {
  id: string;
  status: string;
  message: string;
  data?: Record<string, any>;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
