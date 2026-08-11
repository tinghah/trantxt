# CLAUDE.md

Project instructions for AI coding assistants working on TranTxt.

## Project Overview

TranTxt is an enterprise document translation tool with:
- **Backend**: Node.js + Express + TypeScript + TypeORM + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TailwindCSS + Zustand
- **Infra**: Docker Compose (PostgreSQL, Backend, Frontend/Nginx)

## Multi-PC Sync Workflow

This project is developed across **two PCs** (work + home). Sync is critical.

### Branch Strategy

- `main` — always stable, only merge via PR
- `dev/feature-name` — all work happens here
- Never push directly to `main`

### Commit Convention

Use this format:
```
<type>: <short description>

<optional body with bullet points>
```

Types:
- `feat:` — new feature
- `fix:` — bug fix
- `docker:` — Docker/infra changes
- `ui:` — UI/UX improvements
- `refactor:` — code restructuring
- `docs:` — documentation only

### Sync Flow

```bash
# Start work (on either PC)
git checkout main
git pull origin main
git checkout -b dev/feature-name

# ... make changes ...

# Commit and push
git add -A
git commit -m "feat: description of changes"
git push -u origin dev/feature-name

# Create PR on GitHub, review, merge

# After merge, on BOTH PCs:
git checkout main
git pull origin main
docker compose up -d --build
```

### Rules

1. Always work on a feature branch, never on `main`
2. Commit often with clear messages
3. Push before switching PCs
4. After merging, pull `main` on both PCs and rebuild Docker
5. Never commit secrets, API keys, or .env files
6. Run `docker compose up -d --build` after pulling to verify everything works

## Docker Commands

```bash
# Start everything
docker compose up -d --build

# Rebuild after code changes
docker compose up -d --build frontend   # frontend only
docker compose up -d --build backend    # backend only

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all
docker compose down

# Check status
docker compose ps
```

## Default Credentials (Dev Only)

- Email: `admin@example.com`
- Password: `AdminPassword123!`

## File Structure Notes

- `Dockerfile.backend` — Node.js backend (includes sharp/vips build deps)
- `Dockerfile.frontend` — Nginx + React static build
- `nginx.conf` — Proxies `/api/` to backend:3001
- `docker-compose.yml` — All services, env vars, volumes
- `frontend/src/pages/` — Main page components
- `frontend/src/components/` — Reusable UI components
- `frontend/src/hooks/` — Custom React hooks (useApi, useUpload, useAuth)
- `frontend/src/services/api.ts` — Axios instance with auth interceptors
- `frontend/src/types/index.ts` — All TypeScript interfaces
- `backend/src/` — Express server, routes, models, services

## Document Preview System

### Supported File Types

| Type | Formats | Preview Method |
|------|---------|----------------|
| PDF | pdf | Browser-native iframe viewer |
| Images | jpg, jpeg, png, gif, bmp, tiff, webp, svg | Inline `<img>` tag |
| Text | txt, md, csv, json, xml, html, js, ts, css | Monospace `<pre>` block |
| Documents | docx, doc, epub | "Open in Browser" / Download buttons |

### Backend Endpoints

- `GET /api/documents/:id/preview` — Returns metadata (mimeType, isImage, isText, isPdf, fileUrl, contentPreview)
- `GET /api/documents/:id/file` — Streams raw file with proper Content-Type headers
  - `?download=true` forces attachment download
  - Supports `?token=JWT` for browser-native viewing (iframe/new tab)
- `GET /api/translations/:id/download` — Downloads translated content
  - `?format=txt|pdf|docx` (uses pdfkit/docx libs)
  - Requires `Authorization: Bearer` header (NOT raw fetch without token)
- `POST /api/translations/image` — OCR + translate + re-render image text
- `GET /api/translations/:id/image` — Download translated image (PNG)
- `POST /api/translations` — Text translation with `?sourceLanguage=auto` for detect

### Frontend Components

- `DocumentPreviewModal` — Modal with iframe (PDF), img (images), pre (text), or fallback buttons
- Auth supports query parameter `?token=` for browser-native file viewing

## Known Gotchas

1. **Upload EACCES error**: Fixed by setting `/app/uploads` ownership to `nodejs:nodejs` in Dockerfile
2. **Route Not Found (405)**: Nginx must proxy `/api/` to backend — check `nginx.conf`
3. **sharp build fails in Docker**: Needs `python3 make g++ vips-dev` in Alpine
4. **TypeScript errors in dev mode**: Use compiled `dist/` in production containers, not `ts-node`
5. **PDF preview stuck**: Was caused by reading raw PDF bytes as UTF-8. Fixed with proper file streaming endpoint (`/api/documents/:id/file`)
6. **Auth for browser viewing**: iframe/new tab can't send Authorization headers. Use `?token=JWT` query parameter for file endpoints
7. **Download auth**: `fetch` calls for downloads MUST include `Authorization: Bearer` header. Use `frontend/src/utils/download.ts` helper
8. **Auth persistence**: User object is persisted in localStorage (`trantxt_user`) — `useAuth` rehydrates it so refresh keeps you logged in
10. **useApi data shape**: `useApi` extracts `response.data.data` from axios responses. For endpoints returning `{ data: { translation: {...} } }`, access via `data?.translation`, not directly
11. **Download formats**: Backend respects stored `outputFormats` when no `?format=` param. Frontend has format dropdown per translation
12. **Non-Docker setup**: Works with Node.js 18+ and PostgreSQL 14+. See README
13. **PDF/DOCX text extraction**: Uses `pdfjs-dist` for PDF and `adm-zip` for DOCX/EPUB extraction. Raw UTF-8 reading gives garbled output for binary formats
14. **Docker sharp build**: Use `--ignore-scripts` in builder stage, then `npm rebuild sharp` in production stage (avoids libvips download issues)
15. **Frontend fonts**: Google Fonts CDN loads Noto Sans, Noto Sans Myanmar, Noto Sans TC. Language switcher in Header changes display font
16. **PDF export fonts**: Docker installs font-noto, font-noto-cjk, font-noto-myanmar. PDFKit auto-detects CJK and uses appropriate font

## Testing API Endpoints

```bash
# Health check
Invoke-RestMethod -Uri "http://localhost:3001/health"

# Login
$body = @{ email = "admin@example.com"; password = "AdminPassword123!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" -Method Post -Body $body -ContentType "application/json"

# With auth token
$token = "<token-from-login>"
Invoke-RestMethod -Uri "http://localhost:3001/api/user/history" -Headers @{Authorization="Bearer $token"}
```
