# TranTxt

Enterprise document translation tool with layout preservation, admin controls, and multi-format support.

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, TypeORM, PostgreSQL
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Zustand
- **Infra:** Docker Compose (PostgreSQL + Backend + Nginx)

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

### Linux (Manual)

```bash
# Prerequisites: Node.js 18+, PostgreSQL 14+
git clone https://github.com/tinghah/trantxt.git
cd trantxt

# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run build
npm start

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run build
npm run preview
```

### Windows (Manual)

```powershell
# Prerequisites: Node.js 18+, PostgreSQL 14+
git clone https://github.com/tinghah/trantxt.git
cd trantxt

# Backend
cd backend
npm install
Copy-Item .env.example .env
# Edit .env with your PostgreSQL credentials
npm run build
npm start

# Frontend (new terminal)
cd frontend
npm install
Copy-Item .env.example .env
npm run build
npm run preview
```

### Automation Scripts

```bash
# Linux
chmod +x linux_start.sh
./linux_start.sh

# Windows PowerShell
.\windows_start.ps1
```

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| DATABASE_URL | postgres://user:pass@localhost:5432/trantxt | PostgreSQL URL |
| JWT_SECRET | (set in docker-compose) | JWT signing key |
| JWT_REFRESH_SECRET | (set in docker-compose) | Refresh token key |
| ENCRYPTION_KEY | (set in docker-compose) | 32-char file encryption key |
| ADMIN_EMAIL | admin@example.com | Default admin email |
| ADMIN_PASSWORD | AdminPassword123! | Default admin password |
| CORS_ORIGIN | http://localhost:3000 | Allowed CORS origin |

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

## API Endpoints

### Auth
- `POST /api/auth/signup` — Register
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Refresh token

### Documents
- `POST /api/documents/upload` — Upload files
- `GET /api/documents` — List documents
- `GET /api/documents/:id/preview` — Preview metadata
- `GET /api/documents/:id/file` — Stream file (supports `?download=true`)

### Translations
- `POST /api/translations` — Create translation
- `GET /api/translations/:id` — Get translation
- `GET /api/translations/:id/download` — Download result

### Admin
- `GET /api/admin/users` — List users
- `PUT /api/admin/users/:id/approve` — Approve user
- `PUT /api/admin/users/:id/group` — Assign group
- `PUT /api/admin/users/:id/promote` — Promote to admin
- `GET /api/admin/groups` — List groups
- `POST /api/admin/groups` — Create group
- `PUT /api/admin/groups/:id` — Update group quota

## Docker Commands

```bash
docker compose up -d --build    # Start all services
docker compose down             # Stop all services
docker compose logs -f backend  # View backend logs
docker compose ps               # Check status
```

## License

MIT
