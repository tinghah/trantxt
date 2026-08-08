# Complete .env Configuration Guide

## Overview

The `.env` file contains all configuration for your application. Never commit this to Git - it contains sensitive information.

---

## Backend .env Configuration

### Location
`backend/.env`

### Development Configuration (Local Testing)

```env
# Server Configuration
PORT=3004
NODE_ENV=development

# Database - Local PostgreSQL
DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5432/trantxt

# Security Keys - Generate your own!
JWT_SECRET=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5
JWT_REFRESH_SECRET=yZ6aB7cD8eF9gH0iJ1kL2mN3oP4qR5sT6uV7wX8

# Encryption - MUST be exactly 32 characters
ENCRYPTION_KEY=12345678901234567890123456789012

# File Upload
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=100

# Default Admin (Change immediately after first login!)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!

# Frontend CORS
CORS_ORIGIN=http://localhost:3005

# Logging
LOG_LEVEL=debug

# Optional: Translation APIs (leave empty if not using)
GOOGLE_TRANSLATE_API_KEY=
DEEPL_API_KEY=
AZURE_TRANSLATOR_KEY=
```

### Production Configuration (GCP/Server)

```env
# Server Configuration
PORT=3004
NODE_ENV=production

# Database - Remote PostgreSQL (or managed service)
DATABASE_URL=postgres://trantxt_user:VerySecurePassword123!@db.example.com:5432/trantxt

# Security Keys - IMPORTANT: Generate these securely!
JWT_SECRET=aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789012345
JWT_REFRESH_SECRET=ZyXwVuTsRqPoNmLkJiHgFeDcBa987654321098765

# Encryption - MUST be exactly 32 characters
ENCRYPTION_KEY=aBcDeFgHiJkLmNoPqRsTuVwXyZ1234

# File Upload
FILE_UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE_MB=100

# Default Admin - Change these immediately!
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=SecureAdminPassword2024!

# Frontend CORS
CORS_ORIGIN=https://trantxt.company.com

# Logging
LOG_LEVEL=info

# Translation APIs (Get from provider dashboards)
GOOGLE_TRANSLATE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxx
DEEPL_API_KEY=xxxxxxxxxxxx:fx
AZURE_TRANSLATOR_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Frontend .env Configuration

### Location
`frontend/.env`

### Development Configuration

```env
# Backend API URL
VITE_API_URL=http://localhost:3004

# App Name (optional)
VITE_APP_NAME=TranTxt
```

### Production Configuration

```env
# Backend API URL - Use your domain
VITE_API_URL=https://trantxt.company.com/api

# App Name
VITE_APP_NAME=TranTxt - Enterprise Translation
```

---

## Step-by-Step .env Setup

### For Windows Local Testing

#### 1. Backend .env Setup

```bash
# Navigate to backend
cd D:\coding\vibe\trantxt\backend

# Create .env file (copy the content below into a text editor)
# Save as: backend\.env
```

**Content for `backend\.env`:**
```env
PORT=3004
NODE_ENV=development
DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5432/trantxt
JWT_SECRET=GenerateSecureRandomKeyHere32Chars!!!
JWT_REFRESH_SECRET=AnotherSecureRandomKey32Chars!!!
ENCRYPTION_KEY=12345678901234567890123456789012
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!
CORS_ORIGIN=http://localhost:3005
LOG_LEVEL=debug
```

#### 2. Frontend .env Setup

```bash
# Navigate to frontend
cd D:\coding\vibe\trantxt\frontend

# Create .env file
# Save as: frontend\.env
```

**Content for `frontend\.env`:**
```env
VITE_API_URL=http://localhost:3004
VITE_APP_NAME=TranTxt
```

#### 3. Database Connection Test

```bash
# Test if your .env DATABASE_URL is correct
psql postgres://trantxt_user:secure_password_123@localhost:5432/trantxt

# If successful, you'll see postgres=> prompt
# Type \q to exit
```

---

## How to Generate Secure Keys

### Using PowerShell (Windows)

```powershell
# Generate 32-character random string
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
$base64 = [System.Convert]::ToBase64String($bytes)
$base64.Substring(0, 32)

# Run this 3 times:
# 1st result → JWT_SECRET
# 2nd result → JWT_REFRESH_SECRET
# 3rd result → ENCRYPTION_KEY (must be exactly 32 chars)
```

### Using Linux/Mac

```bash
# Generate 32-character random string
openssl rand -base64 32

# Or for hex version
openssl rand -hex 16

# Run this 3 times for the 3 keys
```

### Using Online Generator (Development Only)

Visit: https://www.random.org/strings/
- Generate 3 strings, 32 characters each
- Use for JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY

---

## Environment Variable Reference

### Backend Environment Variables

| Variable | Type | Example | Notes |
|----------|------|---------|-------|
| `PORT` | Number | 3004 | Backend server port |
| `NODE_ENV` | String | development/production | Affects logging and security |
| `DATABASE_URL` | String | postgres://user:pass@host:port/db | PostgreSQL connection |
| `JWT_SECRET` | String | 32+ random chars | Signs access tokens |
| `JWT_REFRESH_SECRET` | String | 32+ random chars | Signs refresh tokens |
| `ENCRYPTION_KEY` | String | EXACTLY 32 chars | AES-256 encryption |
| `FILE_UPLOAD_DIR` | String | ./uploads or /var/uploads | Where to store files |
| `MAX_FILE_SIZE_MB` | Number | 100 | Maximum upload size |
| `ADMIN_EMAIL` | String | admin@example.com | Default admin email |
| `ADMIN_PASSWORD` | String | Password123! | Default admin password |
| `CORS_ORIGIN` | String | http://localhost:3005 | Frontend domain |
| `LOG_LEVEL` | String | debug/info/warn/error | Logging verbosity |
| `GOOGLE_TRANSLATE_API_KEY` | String | AIzaSy... | Optional: Google Translate API |
| `DEEPL_API_KEY` | String | xxx:fx | Optional: DeepL API |
| `AZURE_TRANSLATOR_KEY` | String | xxxxx | Optional: Azure Translator |

### Frontend Environment Variables

| Variable | Type | Example | Notes |
|----------|------|---------|-------|
| `VITE_API_URL` | String | http://localhost:3004 | Backend API URL |
| `VITE_APP_NAME` | String | TranTxt | Application name |

---

## Database Connection Strings

### Local Development (Windows)
```
postgres://trantxt_user:secure_password_123@localhost:5432/trantxt
```

### Local Development (Custom Port)
```
postgres://trantxt_user:secure_password_123@localhost:5433/trantxt
```

### GCP VM
```
postgres://trantxt_user:GCPSecurePass123!@localhost:5432/trantxt
```

### Remote PostgreSQL (AWS RDS)
```
postgres://trantxt_user:password@mydb.xxxxx.us-east-1.rds.amazonaws.com:5432/trantxt
```

### Cloud SQL (Google)
```
postgres://trantxt_user:password@cloudsql-proxy:5432/trantxt
```

---

## Custom Port Configuration

### Changing Backend Port

Edit `backend/.env`:
```env
PORT=3004  # Change to any available port
```

### Changing PostgreSQL Port

**Windows:**
1. Open PostgreSQL config: `C:\Program Files\PostgreSQL\14\data\postgresql.conf`
2. Find: `port = 5432`
3. Change to: `port = 5433`
4. Restart PostgreSQL service
5. Update DATABASE_URL: `postgres://user:pass@localhost:5433/trantxt`

**Linux:**
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Find: port = 5432
# Change: port = 5433
sudo systemctl restart postgresql
```

### Changing Frontend Port

Edit `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,     // Change here
    strictPort: false,
  },
})
```

Update `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3005  # Update to match
```

---

## Custom Ports Example

If you want:
- PostgreSQL on port 5433
- Backend on port 3004
- Frontend on port 3005

Your files should be:

**backend/.env:**
```env
PORT=3004
DATABASE_URL=postgres://trantxt_user:password@localhost:5433/trantxt
CORS_ORIGIN=http://localhost:3005
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:3004
```

**frontend/vite.config.ts:**
```typescript
server: {
  port: 3005,
}
```

**PostgreSQL config:**
```
port = 5433
```

---

## Environment-Specific Configurations

### Development (.env.development)
```env
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3005
DATABASE_URL=postgres://trantxt_user:dev_password@localhost:5432/trantxt
```

### Staging (.env.staging)
```env
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://staging.trantxt.company.com
DATABASE_URL=postgres://trantxt_user:staging_password@staging-db.company.com:5432/trantxt
```

### Production (.env.production)
```env
NODE_ENV=production
LOG_LEVEL=warn
CORS_ORIGIN=https://trantxt.company.com
DATABASE_URL=postgres://trantxt_user:prod_secure_password@prod-db.company.com:5432/trantxt
```

---

## Security Best Practices

### ✅ DO:
- Generate strong random keys (32+ characters)
- Use different keys for each environment
- Store .env files securely
- Rotate keys periodically
- Use strong database passwords (16+ characters, mixed case, numbers, symbols)
- Never commit .env to Git
- Use .gitignore to exclude .env files
- Use environment secrets in production (AWS Secrets Manager, GCP Secret Manager, etc.)

### ❌ DON'T:
- Hardcode secrets in source code
- Use the same secret for multiple environments
- Share .env files in chat or email
- Use weak passwords (like "password123")
- Commit .env to version control
- Use placeholder secrets in production
- Store .env files in public directories

---

## Troubleshooting .env Issues

### Error: "DATABASE_URL is invalid"
```
✓ Solution: Check your connection string format
✓ Format: postgres://user:password@host:port/database
✓ Test: psql postgres://user:pass@localhost:5432/db
```

### Error: "ENCRYPTION_KEY must be 32 characters"
```
✓ Solution: Generate exactly 32 character string
✓ Length: Count the characters: 12345678901234567890123456789012 (32 chars)
✓ Tool: Use online generator or OpenSSL
```

### Error: "Port already in use"
```
✓ Solution: Change PORT in .env to an available port
✓ Check: netstat -ano | findstr :3004 (Windows)
✓ Or: lsof -i :3004 (Linux/Mac)
```

### Error: "CORS_ORIGIN not matching"
```
✓ Solution: Ensure CORS_ORIGIN matches frontend domain exactly
✓ Example: http://localhost:3005 (not http://localhost:3005/)
✓ Include protocol (http:// or https://)
```

---

## .env File Checklist

Before starting your application:

- ✅ Backend .env created in `backend/` directory
- ✅ Frontend .env created in `frontend/` directory
- ✅ All required variables set (see tables above)
- ✅ Database connection tested with psql
- ✅ .env added to .gitignore
- ✅ Never committed to Git
- ✅ Strong random keys generated
- ✅ Ports are available and not in use
- ✅ CORS_ORIGIN matches frontend URL
- ✅ DATABASE_URL format verified

---

## Quick Setup Verification

### Test Backend .env
```bash
cd backend
npm run dev
# Should see: "Server running on port 3004"
# Should see: "Connected to database"
```

### Test Frontend .env
```bash
cd frontend
npm run dev
# Should see: "Local: http://localhost:3005"
```

### Test Database Connection
```bash
psql postgres://trantxt_user:password@localhost:5432/trantxt
# Should connect successfully
# Type: \q to exit
```

---

## Support

For issues with .env setup:
1. Check the troubleshooting section above
2. Verify all variables are set
3. Test database connection separately
4. Check that ports are not in use
5. Ensure file is saved in correct location (not .env.txt)

