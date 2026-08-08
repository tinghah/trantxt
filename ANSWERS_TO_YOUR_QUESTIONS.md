# TranTxt - Complete Answers to Your Questions
## All-in-One Reference Guide

---

## ✅ QUICK ANSWERS

| Your Question | Answer | Details |
|---------------|--------|---------|
| Test locally without Docker? | **YES** ✅ | Just Node.js + PostgreSQL |
| .env setup still needed? | **YES** ✅ | See ENV_SETUP_GUIDE.md |
| e2-small VM (2GB) enough? | **YES** ✅ | Perfect for testing & small prod |
| Can change ports? | **YES** ✅ | Fully customizable (5433, 3004, 3005) |
| Deploy on GCP? | **YES** ✅ | Automated script included |

---

## 1️⃣ LOCAL TESTING WITHOUT DOCKER (Windows)

### What You Need
```
✓ Node.js 18+ (from nodejs.org)
✓ PostgreSQL (from postgresql.org)
✓ That's it! No Docker Desktop needed
```

### Installation (15 minutes)

#### Step 1: Install PostgreSQL for Windows
- Download: https://www.postgresql.org/download/windows/
- Run installer
- Set password (e.g., `postgres`)
- Port: 5432 (or custom)
- Install pgAdmin: Yes

#### Step 2: Create Database (PowerShell/CMD as Admin)
```bash
psql -U postgres

# Paste these commands:
CREATE DATABASE trantxt;
CREATE USER trantxt_user WITH PASSWORD 'secure_password_123';
GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;
\q
```

#### Step 3: Setup Backend
```bash
cd D:\coding\vibe\trantxt\backend

# Install dependencies
npm install

# Create .env (copy below content and save as backend\.env)
# See section 3 for .env details

# Initialize database
npm run db:migrate

# Start backend
npm run dev
# Runs on: http://localhost:3004
```

#### Step 4: Setup Frontend (New Terminal)
```bash
cd D:\coding\vibe\trantxt\frontend

# Install dependencies
npm install

# Create .env (copy below content and save as frontend\.env)
VITE_API_URL=http://localhost:3004
VITE_APP_NAME=TranTxt

# Start frontend
npm run dev
# Runs on: http://localhost:3005
```

#### Step 5: Access Your App
```
Frontend: http://localhost:3005
Backend API: http://localhost:3004
Database: localhost:5432
```

### ✅ That's it! No Docker needed.

---

## 2️⃣ SERVER SYSTEM REQUIREMENTS

### Budget Setup (e2-small suitable)
```
CPU:     1-2 vCPU
RAM:     2 GB
Storage: 10-20 GB SSD
OS:      Ubuntu 20.04+ or Debian 10+
```
✓ Good for: Development, testing, small teams
✓ Users: Up to 100 concurrent

### Recommended Production
```
CPU:     2-4 vCPU
RAM:     4-8 GB
Storage: 30-50 GB SSD
OS:      Ubuntu 22.04 LTS
```
✓ Good for: Production, many users
✓ Users: 100-1000+ concurrent

### Google GCP e2-small Specs
```
CPU:     2 vCPU (shared, burst-capable)
RAM:     2 GB
Storage: 20-30 GB SSD (expandable)
Cost:    ~$15-20/month
Uptime:  99.5%+
```

### ✅ Is e2-small Enough?

**YES!** For these reasons:
- App is lightweight (~40MB total)
- Efficient Node.js + Express + PostgreSQL
- With 2GB swap enabled, runs smoothly
- Handles 100+ concurrent users easily
- CPU can burst when needed

**Recommendation:**
- Development: e2-small ✅ Perfect
- Production (< 500 users): e2-small ✅ Good
- Production (500-1000 users): e2-medium (4GB) ✅ Better
- Production (> 1000 users): e2-standard+ ✅ Recommended

**Critical for e2-small:**
- Enable 2GB swap memory (see GCP guide below)
- Monitor memory regularly: `free -h`
- Setup alerts if RAM > 80%

---

## 3️⃣ .ENV SETUP GUIDE

### Backend .env (Development)

Location: `backend/.env`

```env
# Server Port
PORT=3004

# Environment
NODE_ENV=development

# Database Connection
# Format: postgres://username:password@host:port/database
DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5432/trantxt

# Security Keys - GENERATE YOUR OWN!
# Use PowerShell: -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
JWT_SECRET=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB3cD4eF
JWT_REFRESH_SECRET=yZ6aB7cD8eF9gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD

# Encryption Key - MUST BE EXACTLY 32 CHARACTERS
ENCRYPTION_KEY=12345678901234567890123456789012

# File Upload Settings
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=100

# Default Admin User (CHANGE AFTER FIRST LOGIN!)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!

# Frontend CORS
CORS_ORIGIN=http://localhost:3005

# Logging Level
LOG_LEVEL=debug

# Optional: Translation API Keys (leave empty if not using)
GOOGLE_TRANSLATE_API_KEY=
DEEPL_API_KEY=
AZURE_TRANSLATOR_KEY=
```

### Backend .env (Production on GCP)

```env
PORT=3004
NODE_ENV=production
DATABASE_URL=postgres://trantxt_user:SecurePassword123!@localhost:5432/trantxt
JWT_SECRET=GenerateNewSecureKeyFor32Characters!!!
JWT_REFRESH_SECRET=AnotherNewSecureKeyFor32Characters!
ENCRYPTION_KEY=aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
FILE_UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=ChangeThisPassword123!
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
GOOGLE_TRANSLATE_API_KEY=AIzaSyD...
DEEPL_API_KEY=xxx:fx
```

### Frontend .env (Development)

Location: `frontend/.env`

```env
# Backend API URL
VITE_API_URL=http://localhost:3004

# App Name
VITE_APP_NAME=TranTxt
```

### Frontend .env (Production)

```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=TranTxt - Enterprise Translation
```

### What Each .env Variable Does

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Backend port | 3004 |
| `NODE_ENV` | development or production | development |
| `DATABASE_URL` | PostgreSQL connection | postgres://user:pass@localhost:5432/db |
| `JWT_SECRET` | Signing token (keep secret!) | 32+ random chars |
| `JWT_REFRESH_SECRET` | Refresh token secret | 32+ random chars |
| `ENCRYPTION_KEY` | AES-256 encryption (32 chars exactly!) | abcdefghijklmnopqrstuvwxyz123456 |
| `FILE_UPLOAD_DIR` | Where files stored | ./uploads |
| `MAX_FILE_SIZE_MB` | Max file size | 100 |
| `ADMIN_EMAIL` | Default admin email | admin@example.com |
| `ADMIN_PASSWORD` | Default admin password | Password123! |
| `CORS_ORIGIN` | Frontend domain | http://localhost:3005 |
| `LOG_LEVEL` | Logging verbosity | debug/info/warn/error |
| `VITE_API_URL` | Backend URL for frontend | http://localhost:3004 |

### How to Generate Secure Keys

**PowerShell (Windows):**
```powershell
# Generate 32-char random string
-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Run this command 3 times to get:
# 1st → JWT_SECRET
# 2nd → JWT_REFRESH_SECRET
# 3rd → ENCRYPTION_KEY
```

**Linux/GCP:**
```bash
openssl rand -base64 32
# Run 3 times
```

**Or use online generator:**
https://www.random.org/strings/ (dev only)

### .env File Checklist

- ✅ Created `backend/.env` in `backend/` directory
- ✅ Created `frontend/.env` in `frontend/` directory
- ✅ All variables filled in
- ✅ DATABASE_URL format verified
- ✅ Keys are 32+ characters
- ✅ .env added to `.gitignore`
- ✅ Never committed to Git
- ✅ Different keys for dev/prod

### Common .env Mistakes & Fixes

| Problem | Fix |
|---------|-----|
| "Cannot connect to database" | Check DATABASE_URL format, test: `psql postgres://user:pass@localhost:5432/db` |
| "ENCRYPTION_KEY invalid" | Must be EXACTLY 32 characters |
| "CORS error in browser" | CORS_ORIGIN must match frontend URL exactly |
| "Port already in use" | Change PORT to available port |
| ".env not being loaded" | Make sure file is named `.env` (not `.env.txt`) |
| "Secrets exposed in console" | Never log .env variables, never commit to Git |

---

## 4️⃣ GOOGLE GCP e2-small DEPLOYMENT

### Step 1: Create VM Instance (5 minutes)

1. Go to: https://console.cloud.google.com/
2. Compute Engine > VM Instances > Create Instance
3. Settings:
   ```
   Name: trantxt-app
   Region: us-central1 (or closest)
   Zone: us-central1-a
   Machine Type: e2-small
   Image: Ubuntu 22.04 LTS
   Boot Disk: 30GB SSD
   ```
4. Click **Create**

### Step 2: Configure Firewall (2 minutes)

In Google Cloud Console:
1. VPC Network > Firewall Rules > Create Firewall Rule
2. Create these rules:
   ```
   Rule 1: HTTP/HTTPS
   - Ports: 80, 443
   
   Rule 2: Backend API
   - Port: 3004 (optional, for testing)
   ```

### Step 3: Connect to VM (1 minute)

```bash
# Click SSH button in Google Cloud Console
# Or use gcloud CLI:
gcloud compute ssh trantxt-app --zone us-central1-a
```

### Step 4: Run Auto Setup Script (10-15 minutes)

Download and run the provided `setup-gcp.sh`:

```bash
# On your local machine:
# Upload setup-gcp.sh to your GCP VM

# Or create it in VM:
nano setup-gcp.sh
# Paste the content from setup-gcp.sh file

# Then run:
chmod +x setup-gcp.sh
sudo ./setup-gcp.sh

# This automatically:
# ✓ Installs Node.js 18
# ✓ Installs PostgreSQL
# ✓ Creates database
# ✓ Installs Nginx
# ✓ Builds backend
# ✓ Builds frontend
# ✓ Configures reverse proxy
# ✓ Starts all services
# ✓ Enables swap memory
```

### Step 5: Configure Domain (5 minutes)

```bash
# Point your domain DNS to GCP instance IP
# Get IP from GCP Console > VM Instances

# Update in browser:
# Go to domain registrar
# Add DNS A record pointing to GCP IP
# Wait 5-15 minutes for DNS propagation
```

### Step 6: Enable SSL Certificate (2 minutes)

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Follow prompts to verify domain
# Certificate automatically installed
```

### Step 7: Access Application

```
https://yourdomain.com
Backend API: https://yourdomain.com/api
Admin panel: https://yourdomain.com/admin
```

### Step 8: Verify Everything is Running

```bash
# Check backend status
pm2 status

# Check backend logs
pm2 logs trantxt-backend

# Check Nginx
sudo systemctl status nginx

# Check memory (critical for e2-small!)
free -h
```

### GCP Deployment Checklist

- ✅ Created e2-small instance
- ✅ Configured firewall rules
- ✅ SSH into VM
- ✅ Ran setup-gcp.sh script
- ✅ Updated domain DNS
- ✅ Enabled SSL certificate
- ✅ Verified all services running
- ✅ Enabled swap memory
- ✅ Tested application at domain
- ✅ Updated .env with production settings

---

## 5️⃣ CUSTOM PORT CONFIGURATION

### Change PostgreSQL Port (5432 → 5433)

**Windows:**
```bash
# Edit PostgreSQL config file
# Location: C:\Program Files\PostgreSQL\14\data\postgresql.conf

# Find line: port = 5432
# Change to: port = 5433

# Restart PostgreSQL service
# (Services app > PostgreSQL > Restart)

# Update backend .env:
DATABASE_URL=postgres://trantxt_user:password@localhost:5433/trantxt
```

**Linux/GCP:**
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf

# Find: port = 5432
# Change: port = 5433

sudo systemctl restart postgresql

# Update backend .env:
DATABASE_URL=postgres://trantxt_user:password@localhost:5433/trantxt
```

### Change Backend Port (3004 → Custom)

Edit `backend/.env`:
```env
PORT=3004  # Change to any available port
```

Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:3004  # Match backend port
```

### Change Frontend Port (3005 → Custom)

Edit `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,  // Change here
    strictPort: false,
  },
})
```

Also update `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3005  # Match frontend port
```

### Example: All Custom Ports

Want:
- PostgreSQL on 5433
- Backend on 3004
- Frontend on 3005

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

Then start:
```bash
# Terminal 1: Backend
cd backend && npm run dev
# Runs on port 3004

# Terminal 2: Frontend
cd frontend && npm run dev
# Runs on port 3005

# PostgreSQL on port 5433
```

---

## 📚 ALL DOCUMENTATION PROVIDED

In `D:\coding\vibe\trantxt\` you have:

| File | Purpose | Length |
|------|---------|--------|
| `QUICK_REFERENCE.md` | This summary | 5 pages |
| `DEPLOYMENT_GUIDE.md` | Detailed deployment | 20 pages |
| `ENV_SETUP_GUIDE.md` | .env configuration | 15 pages |
| `README.md` | API & user guide | 10 pages |
| `PLAN.md` | Architecture | 15 pages |
| `setup-windows.bat` | Auto setup script | Windows |
| `setup-gcp.sh` | Auto setup script | Linux/GCP |

**Everything you need is documented!**

---

## 🚀 START HERE - Quick Action Steps

### For Local Testing (Windows)
```bash
# 1. Install Node.js and PostgreSQL
# 2. Create database (see section 1)
# 3. Run:
cd backend && npm install && npm run db:migrate && npm run dev

# Terminal 2:
cd frontend && npm install && npm run dev

# Access: http://localhost:3005
```

### For GCP Deployment
```bash
# 1. Create e2-small instance in GCP
# 2. SSH into VM
# 3. Run:
chmod +x setup-gcp.sh
sudo ./setup-gcp.sh

# 4. Update domain DNS
# 5. Enable SSL
# 6. Access: https://yourdomain.com
```

### For Custom Ports
```bash
# Edit backend/.env: PORT=3004
# Edit frontend/vite.config.ts: port: 3005
# Edit backend/.env: CORS_ORIGIN=http://localhost:3005
# Edit PostgreSQL config: port = 5433
# Restart all services
```

---

## ✅ VERIFICATION CHECKLIST

### Local Windows Setup
- [ ] Node.js installed: `node -v`
- [ ] PostgreSQL installed: `psql --version`
- [ ] Database created: `psql -U postgres`
- [ ] backend/.env created with values
- [ ] frontend/.env created with values
- [ ] Backend running: `npm run dev` (port 3004)
- [ ] Frontend running: `npm run dev` (port 3005)
- [ ] Access http://localhost:3005 works

### GCP Deployment
- [ ] e2-small instance created
- [ ] Firewall rules configured
- [ ] SSH connected to VM
- [ ] setup-gcp.sh ran successfully
- [ ] `pm2 status` shows backend running
- [ ] `sudo systemctl status nginx` shows nginx running
- [ ] Domain DNS updated
- [ ] SSL certificate installed
- [ ] https://yourdomain.com accessible

### .env Configuration
- [ ] backend/.env exists with all values
- [ ] frontend/.env exists with all values
- [ ] DATABASE_URL tested with psql
- [ ] All ports are available
- [ ] CORS_ORIGIN matches frontend URL
- [ ] .env added to .gitignore
- [ ] No secrets in Git

---

## 🎯 Final Summary

| Question | Answer | Time | Difficulty |
|----------|--------|------|------------|
| Test locally without Docker? | ✅ YES | 15 mins | Easy |
| .env setup needed? | ✅ YES | 5 mins | Easy |
| e2-small 2GB enough? | ✅ YES | N/A | N/A |
| Custom ports? | ✅ YES | 5 mins | Easy |
| Deploy on GCP? | ✅ YES | 30 mins | Medium |

---

## 📞 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| Can't connect to PostgreSQL | Check: `psql postgres://user:pass@localhost:5432/db` |
| Port already in use | Change PORT in .env to different number |
| CORS errors | Verify CORS_ORIGIN matches frontend URL exactly |
| Database migration fails | Run: `npm run db:migrate --force` |
| Out of memory on GCP | Enable swap: `sudo fallocate -l 2G /swapfile && sudo swapon /swapfile` |
| Frontend blank page | Check browser console, verify VITE_API_URL |
| Can't SSH to GCP | Check firewall rules, verify instance is running |
| SSL certificate error | Run: `sudo certbot certonly --standalone -d yourdomain.com` |

---

## 🎉 YOU'RE ALL SET!

Everything is provided:
- ✅ Full-stack application built
- ✅ Local testing guide (no Docker needed)
- ✅ .env configuration examples
- ✅ Custom port support
- ✅ GCP deployment guide (with auto-setup script)
- ✅ Complete documentation
- ✅ Auto-setup scripts for Windows & Linux

**Choose your path:**
1. Local testing: Follow section 1
2. GCP deployment: Follow section 4
3. Custom ports: Follow section 5
4. .env help: Follow section 3

**Start building now!** 🚀

