# TranTxt

Enterprise document translation tool with layout preservation, admin controls, and multi-format support.

## Quick Start

### Docker (Recommended)

```bash
git clone https://github.com/tinghah/trantxt.git
cd trantxt
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Login: `admin@example.com` / `AdminPassword123!`

### Linux (Manual — No Docker)

**Prerequisites:** Node.js 18+, PostgreSQL 14+, npm

```bash
# Clone
git clone https://github.com/tinghah/trantxt.git
cd trantxt

# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE trantxt;"

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL to postgres://user:password@localhost:5432/trantxt
npm run build
npm start

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:3001
npm run build
npx vite preview
```

Or use the automation script: `./linux_start.sh`

### Windows (Manual — No Docker)

**Prerequisites:** Node.js 18+, PostgreSQL 14+, npm

```powershell
# Clone
git clone https://github.com/tinghah/trantxt.git
cd trantxt

# Create PostgreSQL database (in psql)
# CREATE DATABASE trantxt;

# Backend
cd backend
npm install
Copy-Item .env.example .env
# Edit .env — set DATABASE_URL
npm run build
npm start

# Frontend (new terminal)
cd frontend
npm install
Copy-Item .env.example .env
# Edit .env — set VITE_API_URL=http://localhost:3001
npm run build
npx vite preview
```

Or use: `.\windows_start.ps1`

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript, TypeORM, PostgreSQL |
| Frontend | React, TypeScript, Vite, TailwindCSS, Zustand |
| Infra | Docker Compose, Nginx (proxy) |
| OCR | tesseract.js (image translation) |
| Export | pdfkit (PDF), docx (DOCX) |

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| DATABASE_URL | postgres://user:pass@localhost:5432/trantxt | PostgreSQL URL |
| JWT_SECRET | your-secret-key | JWT signing key |
| JWT_REFRESH_SECRET | your-refresh-secret | Refresh token key |
| ENCRYPTION_KEY | your-32-char-encryption-key | File encryption key |
| ADMIN_EMAIL | admin@example.com | Default admin email |
| ADMIN_PASSWORD | AdminPassword123! | Default admin password |
| GOOGLE_TRANSLATE_API_KEY | (empty) | Google Translate API key |
| DEEPL_API_KEY | (empty) | DeepL API key |
| AZURE_TRANSLATOR_KEY | (empty) | Azure Translator key |
| AZURE_TRANSLATOR_ENDPOINT | (empty) | Azure Translator endpoint |

### Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:3001 | Backend API URL |

## Supported File Types

| Category | Formats |
|----------|---------|
| Documents | PDF, DOCX, DOC, EPUB |
| Text | TXT, MD, CSV, JSON, XML, HTML |
| Images | JPG, PNG, GIF, BMP, TIFF, WebP, SVG |

## Features

- **Document Translation**: Upload documents, translate to 100+ languages
- **Image Translation**: OCR text from images, translate, re-render with translated text
- **Output Formats**: Download as TXT, PDF, or DOCX
- **Auto-Detect Language**: Automatically detect source language
- **Admin Dashboard**: User/group management, quota control, audit logs
- **Dark Mode**: Terminal-inspired dark theme with blue accents
- **File Preview**: In-app preview for PDFs, images, text files
- **BYOK**: Bring Your Own API key for translation providers

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token

### Documents
- `POST /api/documents/upload` — Upload files
- `GET /api/documents` — List documents
- `GET /api/documents/:id/preview` — Preview metadata
- `GET /api/documents/:id/file` — Stream file (`?token=JWT` for browser viewing)

### Translations
- `POST /api/translations` — Text translation
- `POST /api/translations/image` — Image OCR + translate + re-render
- `GET /api/translations/:id` — Get translation details
- `GET /api/translations/:id/download?format=txt|pdf|docx` — Download result
- `GET /api/translations/:id/image` — Download translated image

### Admin
- `GET /api/admin/users` — List users
- `PUT /api/admin/users/:id/approve` — Approve user
- `PUT /api/admin/users/:id/promote` — Promote to admin
- `GET /api/admin/groups` — List groups
- `POST /api/admin/groups` — Create group

## License

MIT
