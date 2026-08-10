// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface NewPasswordRequest {
  token: string;
  password: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isApproved: boolean;
  groupId?: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface UserProfile extends User {
  groupName?: string;
  totalTranslations: number;
  totalPages: number;
  storageUsed: number;
}

// Document Types
export interface Document {
  id: string;
  filename: string;
  originalFormat: string;
  fileSizeBytes: number;
  uploadDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sourceLanguage: string;
  pageCount: number;
  hasImages: boolean;
  errorMessage?: string;
}

export interface DocumentPreview {
  id: string;
  content: string;
  pages: number;
  language: string;
}

// Translation Types
export interface TranslationRequest {
  documentId: string;
  targetLanguages: string[];
  outputFormat: 'pdf' | 'docx' | 'txt';
  priority: 'low' | 'normal' | 'high';
  requestApproval?: boolean;
}

export interface Translation {
  id: string;
  documentId: string;
  documentName: string;
  sourceLanguage: string;
  targetLanguages: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  tokensUsed: number;
  downloadCount: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface TranslationDetail extends Translation {
  originalContent: string;
  translatedContent?: Record<string, string>;
  outputFormats: string[];
  errorMessage?: string;
}

// Usage Types
export interface UsageMetrics {
  yearMonth: string;
  pagesTranslated: number;
  tokensUsed: number;
  filesUploaded: number;
  totalSizeBytes: number;
}

export interface UserQuota {
  monthlyPageLimit: number;
  pagesRemaining: number;
  fileSizeLimit: number;
  fileSizeUsed: number;
  concurrentUploadsLimit: number;
  concurrentUploadsUsed: number;
}

// Group Types
export interface UserGroup {
  id: string;
  name: string;
  description: string;
  monthlyPageLimit: number;
  fileSizeLimitMb: number;
  concurrentUploads: number;
  tokenQuota: number;
  translationApisAllowed: string[];
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
}

// Admin Types
export interface AdminUser extends User {
  group?: UserGroup;
  approvedAt?: string;
  approvedBy?: string;
  lastActivityAt?: string;
  translationCount: number;
}

export interface AdminStats {
  totalUsers: number;
  totalGroups: number;
  totalDocuments: number;
  totalTranslations: number;
  pagesProcessed: number;
  tokensUsed: number;
  totalStorage: number;
  activeUsers: number;
}

export interface TranslationApproval {
  id: string;
  documentName: string;
  userName: string;
  sourceLanguage: string;
  targetLanguages: string[];
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'failure';
}

// Configuration Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isEnabled: boolean;
  sortOrder: number;
}

export interface TranslationProvider {
  id: string;
  name: string;
  configured: boolean;
  serverKeyConfigured: boolean;
}

export interface ProvidersResponse {
  providers: TranslationProvider[];
  freeAvailable: boolean;
  serverConfigured: boolean;
}

export interface ApiKeyRecord {
  id: string;
  provider: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  keyMasked: string;
  metadata?: Record<string, any>;
}

export interface DocumentPreview {
  document: Document;
  mimeType: string;
  isImage: boolean;
  dataUrl?: string;
  contentPreview?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: ValidationError[];
  statusCode?: number;
}

// File Upload Types
export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface UploadResponse {
  documentId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}
