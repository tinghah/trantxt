# Enterprise Translation Tool - Implementation Plan

## Project Overview
A secure, full-stack web application for uploading and translating documents (PDF, DOCX, images) while preserving original layout, formatting, and design. Built for enterprise use with admin controls, user management, quota systems, and comprehensive audit logging.

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL
- **File Storage:** Server-side encrypted storage
- **PDF Processing:** PDF.js (client) + server-side processing
- **Document Formats:** PDF, DOCX (docx library), Images (Sharp + Tesseract for OCR)
- **Translation APIs:** Multi-provider support (Google Translate, DeepL, Azure Translator)
- **Authentication:** JWT-based email/password
- **Containerization:** Docker + Docker Compose
- **Environment:** Node.js 18+, npm/yarn

---

## Data Models

### Users Table
```
- id (UUID)
- email (unique)
- password_hash
- name
- created_at
- last_login
- is_admin (boolean)
- is_approved (boolean, default: false)
- group_id (FK to user_groups)
- api_key (for user's own translation API)
- api_key_hash (hashed for security)
```

### UserGroups Table
```
- id (UUID)
- name
- description
- monthly_page_limit (default: 100)
- file_size_limit_mb (default: 50)
- concurrent_uploads (default: 5)
- token_quota (default: 10000)
- translation_apis_allowed (JSON array)
- created_at
- updated_at
```

### Documents Table
```
- id (UUID)
- user_id (FK)
- filename
- original_format (pdf, docx, jpg, png, etc.)
- file_path (encrypted storage path)
- file_size_bytes
- upload_date
- status (pending, processing, completed, failed)
- source_language (detected)
- page_count (for quota tracking)
- has_images (boolean)
- metadata (JSON: extracted text blocks with positions, fonts, colors)
- error_message (if failed)
```

### Translations Table
```
- id (UUID)
- document_id (FK)
- user_id (FK)
- source_language
- target_language
- target_languages (JSON array if multi-lang request)
- original_content (JSON: structured text blocks)
- translated_content (JSON: translated blocks with layout)
- tokens_used
- created_at
- output_formats (JSON: available download formats)
- approval_status (pending, approved, rejected)
- approved_by (admin user_id if applicable)
- approved_at
- download_count
```

### UsageMetrics Table
```
- id (UUID)
- user_id (FK)
- year_month (YYYY-MM format)
- pages_translated
- tokens_used
- files_uploaded
- total_size_bytes
- api_calls_by_provider (JSON)
- created_at
- updated_at
```

### AuditLogs Table
```
- id (UUID)
- user_id (FK, nullable for system actions)
- action (upload, translate, download, approve, reject, etc.)
- resource_type (document, translation, user, group)
- resource_id (FK to resource)
- changes (JSON: before/after values for updates)
- ip_address
- timestamp
- status (success, failure)
```

### TranslationApiKeys Table
```
- id (UUID)
- provider (google, deepl, azure, custom)
- api_key_encrypted
- api_secret_encrypted (if needed)
- is_active (boolean)
- created_at
- updated_at
- created_by_admin (user_id)
```

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/reset-password` - Request password reset

### User Management
- `GET /api/user/profile` - Get user profile & usage stats
- `PUT /api/user/profile` - Update profile
- `GET /api/user/history` - Get translation history (paginated)
- `GET /api/user/usage` - Get current month usage metrics
- `GET /api/user/quota` - Get remaining quota for user's group
- `PUT /api/user/settings` - Update user preferences
- `GET /api/user/api-keys` - Get user's API keys
- `POST /api/user/api-keys` - Add custom translation API key

### Document Management
- `POST /api/documents/upload` - Upload single or multiple files
- `GET /api/documents` - List user's documents (paginated)
- `GET /api/documents/:id` - Get document details
- `DELETE /api/documents/:id` - Delete document (if not translated)
- `GET /api/documents/:id/preview` - Preview document

### Translation
- `POST /api/translations` - Create translation request
  - Body: `{ documentId, targetLanguages, outputFormat, priority, requestApproval }`
- `GET /api/translations/:id` - Get translation status
- `GET /api/translations/:id/preview` - Preview translated document
- `GET /api/translations/:id/download` - Download translated file
- `GET /api/translations/:id/compare` - Compare original vs translated (side-by-side)
- `PUT /api/translations/:id/regenerate` - Regenerate with different settings

### Admin - User Management
- `GET /api/admin/users` - List all users (paginated, filterable)
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/approve` - Approve new user
- `PUT /api/admin/users/:id/group` - Assign user to group
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/:id/audit` - Get user's audit log

### Admin - Group Management
- `GET /api/admin/groups` - List user groups
- `POST /api/admin/groups` - Create new group
- `PUT /api/admin/groups/:id` - Update group limits
- `DELETE /api/admin/groups/:id` - Delete group
- `GET /api/admin/groups/:id/members` - List group members
- `GET /api/admin/groups/:id/usage` - Aggregate group usage

### Admin - Translations
- `GET /api/admin/translations/pending` - Get pending approvals
- `PUT /api/admin/translations/:id/approve` - Approve translation
- `PUT /api/admin/translations/:id/reject` - Reject translation
- `GET /api/admin/translations` - List all translations (searchable)

### Admin - Analytics
- `GET /api/admin/analytics/dashboard` - Overall stats
- `GET /api/admin/analytics/usage` - Usage by user/group/time period
- `GET /api/admin/analytics/performance` - Translation performance metrics
- `GET /api/admin/audit-logs` - Audit log search

### Admin - Configuration
- `GET /api/admin/config/translation-apis` - List configured translation APIs
- `PUT /api/admin/config/translation-apis` - Update API configuration
- `GET /api/admin/config/system` - System settings
- `PUT /api/admin/config/system` - Update system settings

---

## Security Architecture

### Authentication & Authorization
- JWT with RS256 (RSA) for signed tokens
- Refresh tokens stored in HttpOnly cookies
- Role-based access control (user, admin)
- API key management for user's own translation APIs

### Data Protection
- **At Rest:** AES-256-GCM encryption for uploaded files
- **In Transit:** TLS 1.3 mandatory
- **Passwords:** bcrypt with salt rounds = 12
- **API Keys:** Encrypted with master key, never logged

### Input Validation
- File type whitelist (pdf, docx, jpg, png, gif, bmp, tiff)
- File size limits enforced at API and database level
- Malware scanning integration (ClamAV optional)
- Strict SQL parameterized queries (ORM)

### Rate Limiting & Abuse Prevention
- Global rate limit: 100 requests/minute per IP
- Per-user rate limit: 50 requests/minute
- Upload rate limit: 10 files/minute per user
- Translation rate limit: 5 concurrent jobs per user
- Quota enforcement: pages/month, file size, token usage

### Audit & Monitoring
- All admin actions logged
- All translations logged
- All user actions logged (with IP address)
- Searchable audit logs with filtering
- Alert on suspicious activity (optional)

---

## Frontend Architecture

### Pages & Components

**Public Pages**
- `/` - Landing page
- `/login` - Login form
- `/signup` - Registration form
- `/forgot-password` - Password reset request

**User Dashboard**
- `/dashboard` - Main dashboard (recent translations)
- `/upload` - Upload interface with drag-drop
- `/translations/:id` - Translation detail & preview
- `/history` - Full translation history
- `/downloads` - All downloaded files
- `/profile` - User profile & settings
- `/usage` - Detailed usage statistics
- `/api-keys` - Manage custom API keys

**Admin Pages**
- `/admin/dashboard` - Analytics overview
- `/admin/users` - User management
- `/admin/groups` - Group management
- `/admin/translations/pending` - Pending approvals queue
- `/admin/translations` - All translations search
- `/admin/audit-logs` - Audit log viewer
- `/admin/settings` - System configuration
- `/admin/api-config` - Translation API management

### Design System
- **Color Scheme:**
  - Primary: Blue (#0066CC, #0052A3)
  - Secondary: Dark green (#1B7F3A)
  - Neutral: White, light gray (#F5F5F5), dark gray (#333333)
  - Dark mode: Dark background (#1A1A1A), light text
  - Accent: Green for success, red for errors, yellow for warnings

- **Typography:** Inter or Roboto (system fonts)
- **Spacing:** 8px base unit
- **Responsive:** Mobile-first, breakpoints at 640px, 1024px, 1280px
- **Accessibility:** WCAG 2.1 AA standard

### UI Components
- Form inputs with validation feedback
- Drag-drop file upload
- Progress indicators for translations
- Notification toasts (success, error, info)
- Modal dialogs for confirmations
- Data tables with sorting/filtering/pagination
- Charts for analytics (Chart.js or Recharts)
- Loading skeletons

---

## Backend Architecture

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── middleware/
│   │   ├── auth.ts (JWT verification)
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── logger.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── documents.ts
│   │   ├── translations.ts
│   │   └── admin.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── documentController.ts
│   │   ├── translationController.ts
│   │   └── adminController.ts
│   ├── services/
│   │   ├── userService.ts
│   │   ├── documentService.ts
│   │   ├── translationService.ts
│   │   ├── encryptionService.ts
│   │   ├── quotaService.ts
│   │   ├── auditService.ts
│   │   └── translationApiService.ts (multi-provider)
│   ├── models/
│   │   ├── User.ts
│   │   ├── Document.ts
│   │   ├── Translation.ts
│   │   ├── UsageMetrics.ts
│   │   ├── AuditLog.ts
│   │   └── UserGroup.ts
│   ├── utils/
│   │   ├── fileProcessor.ts (PDF, DOCX, image extraction)
│   │   ├── layoutPreserver.ts (formatting preservation)
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── index.ts (shared types)
│   │   ├── express.d.ts (custom express types)
│   │   └── api.ts
│   └── app.ts (main app file)
├── migrations/
│   └── *.sql (database migrations)
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── docker-compose.yml
└── package.json
```

### Key Services

**DocumentService**
- Upload file handling
- File type validation
- Text extraction with layout metadata
- Language detection
- Storage encryption

**TranslationService**
- Submit translation requests
- Multi-provider API orchestration
- Token usage tracking
- Error handling & retries
- Output format generation

**QuotaService**
- Check user's remaining quota
- Track usage metrics
- Enforce limits
- Block over-quota requests

**EncryptionService**
- AES-256-GCM for files
- Key management
- Secure key storage (environment-based)

**AuditService**
- Log all user actions
- Log all admin actions
- Searchable audit trails
- Retention policies

---

## Frontend Architecture

### Project Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/ (Login, Signup, ResetPassword)
│   │   ├── Upload/ (DragDrop, FilePreview)
│   │   ├── Dashboard/ (RecentTranslations, Stats)
│   │   ├── Translation/ (Preview, Compare, Download)
│   │   ├── Admin/ (UserManagement, Analytics, etc.)
│   │   ├── Common/ (Header, Sidebar, Nav)
│   │   └── Layout/
│   ├── pages/
│   │   ├── index.tsx (landing)
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── dashboard/
│   │   ├── translations/
│   │   ├── profile/
│   │   ├── admin/
│   │   └── 404.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useUpload.ts
│   │   └── useUser.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── services/
│   │   ├── api.ts (axios instance)
│   │   └── auth.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── styles/
│   │   └── globals.css (Tailwind)
│   └── types/
│       └── index.ts
├── .env.example
└── package.json
```

### State Management
- Context API for auth state
- React Query for API caching
- Local state for forms

---

## Implementation Phases

### Phase 1: MVP (Weeks 1-2)
- [x] Project setup & scaffolding
- [x] Database schema & migrations
- [x] Authentication (signup, login, JWT)
- [x] User profiles & basic dashboard
- [x] PDF upload & text extraction
- [x] Single-language PDF translation
- [x] Basic layout preservation
- [x] Simple admin dashboard (user list, approvals)
- [x] Usage tracking & quotas
- [ ] Deployment setup

### Phase 2: Multi-Format & Features (Week 3)
- [ ] DOCX support
- [ ] Image (JPG, PNG) support & OCR
- [ ] Multiple output formats
- [ ] Translation history
- [ ] User groups & advanced quotas
- [ ] Email notifications
- [ ] Admin approval workflows (optional)

### Phase 3: Enterprise Features (Week 4+)
- [ ] Advanced analytics & reporting
- [ ] Audit logging & compliance
- [ ] Custom translation API key management
- [ ] Rate limiting & abuse prevention
- [ ] Batch processing / scheduled jobs
- [ ] Collaborative features (sharing)
- [ ] Custom glossaries/terminology

---

## Security Considerations

### Infrastructure
- Deployed behind reverse proxy (Nginx)
- TLS certificates (Let's Encrypt)
- CORS properly configured
- CSRF protection via SameSite cookies

### Database
- Row-level security (users can only access their data)
- Prepared statements (no SQL injection)
- Encrypted sensitive fields
- Regular backups with encryption

### File Handling
- Uploaded files scanned for malware
- Files stored outside web root
- Secure file permissions (600)
- Automatic cleanup of old files

### API Security
- Input validation on all endpoints
- Rate limiting with exponential backoff
- API key rotation mechanisms
- Logging of failed authentication attempts

---

## Development Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Git

### Local Development
```bash
# Clone repo
git clone <repo>
cd trantxt

# Install dependencies
npm install

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start services
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development servers
npm run dev
```

### Environment Variables
```
# Backend
DATABASE_URL=postgres://user:password@localhost:5432/trantxt
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
ENCRYPTION_KEY=<generated-key>
GOOGLE_TRANSLATE_API_KEY=<optional>
DEEPL_API_KEY=<optional>
NODE_ENV=development
PORT=3001

# Frontend
REACT_APP_API_URL=http://localhost:3001
```

---

## Testing Strategy

### Unit Tests
- Service layer logic
- Utility functions
- Validation functions

### Integration Tests
- API endpoints
- Database interactions
- File processing

### E2E Tests
- User signup flow
- Document upload flow
- Translation flow
- Admin workflows

---

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backed up
- [ ] SSL certificates in place
- [ ] Rate limiting enabled
- [ ] Logging & monitoring configured
- [ ] CORS properly restricted
- [ ] Admin credentials secured
- [ ] File storage encrypted
- [ ] Regular backups scheduled

### Deployment Options
- Docker Compose on VPS (DigitalOcean, Linode, etc.)
- Kubernetes for scalability
- AWS/Azure managed services

---

## Success Metrics

- Users can upload documents in multiple formats
- Translations preserve original layout/formatting
- Admin can manage users and quotas
- All data is encrypted at rest
- Audit logs track all user actions
- System handles 100+ concurrent users
- API response time < 2 seconds (excluding translation time)

---

## Future Enhancements

- Real-time collaborative translation
- Batch processing & scheduling
- Custom translation models
- Advanced NLP features (terminology management)
- Multi-language document detection
- Blockchain-based audit trails (optional)
- Mobile app (React Native)
- Advanced compliance features (GDPR, HIPAA)
