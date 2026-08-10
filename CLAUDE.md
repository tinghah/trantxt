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

## Known Gotchas

1. **Upload EACCES error**: Fixed by setting `/app/uploads` ownership to `nodejs:nodejs` in Dockerfile
2. **Route Not Found (405)**: Nginx must proxy `/api/` to backend — check `nginx.conf`
3. **sharp build fails in Docker**: Needs `python3 make g++ vips-dev` in Alpine
4. **TypeScript errors in dev mode**: Use compiled `dist/` in production containers, not `ts-node`

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
