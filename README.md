# Enterprise Translation Tool (TranTxt)

A secure, full-stack web application for uploading and translating documents (PDF, DOCX, images) while preserving original layout, formatting, and design. Built for enterprise use with admin controls, user management, quota systems, and comprehensive audit logging.

## 🎯 Features

### User Features
- **Multi-Format Support**: Upload PDF, DOCX, images with automatic text extraction
- **Layout Preservation**: Translated documents maintain original formatting, fonts, colors, and spacing
- **Multiple Languages**: Support for 100+ languages (configurable by admin)
- **Translation History**: Track all translations with full download access
- **Usage Dashboard**: Real-time metrics showing page usage, token consumption, and file uploads
- **User Profiles**: Manage account settings, API keys, and preferences
- **Secure Storage**: All files encrypted at rest with AES-256-GCM

### Admin Features
- **User Management**: Approve new users, assign to groups, manage permissions
- **Group Management**: Create user groups with custom quota limits
- **Quota Control**: Set page limits, file size limits, token quotas per user/group
- **Translation Approvals**: Review and approve/reject translations before delivery
- **Analytics Dashboard**: System-wide usage analytics and performance metrics
- **Audit Logs**: Complete audit trail of all user actions for compliance
- **API Configuration**: Manage multiple translation providers (Google, DeepL, Azure)

### Security
- JWT-based authentication with refresh tokens
- Role-based access control (User, Admin)
- AES-256-GCM encryption for files and sensitive data
- Rate limiting to prevent abuse
- Input validation and sanitization
- HTTPS/TLS encryption in transit
- Bcrypt password hashing
- Comprehensive audit logging

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **File Processing**: Sharp, PDFKit, docx, Tesseract.js

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router
- **UI Components**: Custom + react-hot-toast

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx
- **Database**: PostgreSQL in Docker
- **Volumes**: Named volumes for data persistence

## 📋 Requirements

- Node.js 18.x or higher
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 14+ (if running without Docker)
- npm or yarn package manager

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd trantxt

# Create environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# Initialize database
docker-compose exec backend npm run db:migrate

# Application is now running at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your PostgreSQL connection string
# DATABASE_URL=postgres://user:password@localhost:5432/trantxt

# Initialize database
npm run db:migrate

# Start development server
npm run dev
# Backend runs on http://localhost:3001
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
# Frontend runs on http://localhost:3000
```

## 📁 Project Structure

```
trantxt/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # TypeORM entities
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   ├── database/          # Migrations
│   │   └── index.ts           # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities
│   │   ├── styles/            # CSS
│   │   ├── App.tsx            # Main app
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml          # Docker services
├── Dockerfile.backend          # Backend container
├── Dockerfile.frontend         # Frontend container
├── nginx.conf                  # Nginx configuration
├── PLAN.md                     # Detailed architecture plan
└── README.md                   # This file
```

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/signup           # Register new user
POST /api/auth/login            # Login with email/password
POST /api/auth/refresh          # Refresh JWT token
POST /api/auth/logout           # Logout user
POST /api/auth/reset-password   # Request password reset
```

### User Endpoints

```
GET  /api/user/profile          # Get user profile & stats
PUT  /api/user/profile          # Update profile
GET  /api/user/history          # Get translation history
GET  /api/user/usage            # Get usage metrics
GET  /api/user/quota            # Get remaining quota
PUT  /api/user/settings         # Update settings
```

### Document Endpoints

```
POST /api/documents/upload      # Upload files
GET  /api/documents             # List user's documents
GET  /api/documents/:id         # Get document details
DELETE /api/documents/:id       # Delete document
GET  /api/documents/:id/preview # Preview document
```

### Translation Endpoints

```
POST /api/translations          # Create translation request
GET  /api/translations/:id      # Get translation status
GET  /api/translations/:id/preview # Preview translation
GET  /api/translations/:id/download # Download file
```

### Admin Endpoints

```
GET  /api/admin/users           # List all users
GET  /api/admin/users/:id       # Get user details
PUT  /api/admin/users/:id/approve # Approve user
GET  /api/admin/groups          # List user groups
POST /api/admin/groups          # Create group
GET  /api/admin/translations/pending # Pending approvals
PUT  /api/admin/translations/:id/approve # Approve translation
GET  /api/admin/analytics/dashboard # System stats
```

## 🔐 Security Best Practices

1. **Environment Variables**: Store all secrets in `.env` files (never commit)
2. **HTTPS Only**: Enable TLS in production
3. **CORS**: Configure CORS_ORIGIN for your domain only
4. **Database**: Use strong passwords, enable SSL connections
5. **Rate Limiting**: Enabled by default to prevent abuse
6. **Audit Logging**: All actions are logged for compliance
7. **File Uploads**: Validated by type, size, and scanned for malware (optional)

## 📊 Environment Variables

### Backend (.env)

```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgres://user:password@host:5432/trantxt
JWT_SECRET=your-random-secret-key
JWT_REFRESH_SECRET=your-random-refresh-key
ENCRYPTION_KEY=your-32-char-encryption-key
FILE_UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecurePassword123!
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Frontend (.env)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=TranTxt
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                # Run all tests
npm run test:unit      # Unit tests only
npm run test:integration # Integration tests
```

### Frontend Tests

```bash
cd frontend
npm test                # Run all tests
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm run build          # Compiles TypeScript to dist/
npm start              # Start production server
```

### Frontend

```bash
cd frontend
npm run build          # Creates optimized build in dist/
npm run preview        # Preview production build
```

### Docker

```bash
# Build images
docker-compose build

# Start production services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔧 Configuration

### Translation APIs

To use specific translation providers, add their API keys to the backend .env file:

```env
GOOGLE_TRANSLATE_API_KEY=your-key
DEEPL_API_KEY=your-key
AZURE_TRANSLATOR_KEY=your-key
```

### User Quotas

Default quotas per user group:
- Monthly page limit: 100 pages
- File size limit: 50 MB per upload
- Concurrent uploads: 5 files
- Token quota: 10,000 tokens/month

Admins can customize these per group.

## 🆘 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps

# Verify connection string in .env
# Format: postgres://user:password@host:port/database

# Restart database
docker-compose restart postgres
```

### API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Verify port 3001 is accessible
curl http://localhost:3001/api/health
```

### Frontend Not Loading

```bash
# Check frontend logs
docker-compose logs frontend

# Clear browser cache and hard refresh (Ctrl+Shift+R)

# Check CORS configuration
```

## 📈 Performance Optimization

- **Database Indexing**: Indexed on commonly queried fields
- **Caching**: Implements Redis-ready architecture
- **Compression**: Gzip enabled on API responses
- **CDN Ready**: Static assets can be served via CDN
- **Pagination**: All list endpoints paginated by default

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues, questions, or feedback:
- GitHub Issues: [Report a bug](https://github.com/your-repo/issues)
- Email: support@trantxt.com
- Documentation: [Full docs](./PLAN.md)

## 🗺️ Roadmap

### Phase 1 (Complete)
- ✅ Authentication and user management
- ✅ PDF upload and translation
- ✅ Basic admin dashboard
- ✅ Quota management

### Phase 2 (In Progress)
- [ ] Multi-format support (DOCX, images)
- [ ] Translation approvals
- [ ] Advanced analytics
- [ ] Email notifications

### Phase 3 (Planned)
- [ ] Collaborative features
- [ ] Batch processing
- [ ] Custom glossaries
- [ ] Mobile app

## 🎉 Credits

Built with ❤️ for enterprise translation needs.

---

**Last Updated**: August 2026
**Version**: 1.0.0
