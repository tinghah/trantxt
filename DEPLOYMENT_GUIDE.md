# Local Testing & Deployment Guide for TranTxt

## Part 1: Local Testing WITHOUT Docker Desktop (Windows)

### Prerequisites
1. **Node.js 18+** - Download from https://nodejs.org/
2. **PostgreSQL 14+** - Download from https://www.postgresql.org/download/windows/
3. **Git** - Download from https://git-scm.com/

### Step-by-Step Setup

#### A. Install PostgreSQL on Windows

1. Download PostgreSQL installer for Windows
2. Run installer, set:
   - **Port**: 5432 (or your custom port, e.g., 5433)
   - **Password**: Remember this! (e.g., `postgres`)
   - **Install pgAdmin**: Yes (helpful for database management)

3. After installation, verify PostgreSQL is running:
```bash
psql --version
```

4. Create database and user:
```bash
# Open Command Prompt or PowerShell as Administrator

# Connect to PostgreSQL
psql -U postgres

# Inside psql prompt (postgres=#)
CREATE DATABASE trantxt;
CREATE USER trantxt_user WITH PASSWORD 'secure_password_123';
ALTER ROLE trantxt_user SET client_encoding TO 'utf8';
ALTER ROLE trantxt_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE trantxt_user SET default_transaction_deferrable TO on;
ALTER ROLE trantxt_user SET default_transaction_read_only TO off;
ALTER ROLE trantxt_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;
\q
```

#### B. Setup Backend (Windows Command Prompt/PowerShell)

```bash
# Navigate to backend
cd D:\coding\vibe\trantxt\backend

# Install dependencies
npm install

# Create .env file
# Copy the content below and save as .env
```

Create `backend\.env`:
```env
PORT=3004
NODE_ENV=development
DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5433/trantxt
JWT_SECRET=your-random-secret-key-min-32-characters-long-12345
JWT_REFRESH_SECRET=your-random-refresh-key-min-32-chars-longerr
ENCRYPTION_KEY=12345678901234567890123456789012
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!
CORS_ORIGIN=http://localhost:3005
LOG_LEVEL=debug
```

**Important**: Generate secure random keys:
```bash
# Open PowerShell
# Generate 32-character random strings for secrets
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

#### C. Initialize Database

```bash
cd D:\coding\vibe\trantxt\backend

# Run migrations (creates tables)
npm run db:migrate
```

#### D. Start Backend Server

```bash
cd D:\coding\vibe\trantxt\backend

# Development mode (auto-reload)
npm run dev
# OR production mode
npm run build
npm start
```

Backend will run on: **http://localhost:3004**

#### E. Setup Frontend (New Terminal/PowerShell Window)

```bash
cd D:\coding\vibe\trantxt\frontend

# Install dependencies
npm install

# Create .env file
```

Create `frontend\.env`:
```env
VITE_API_URL=http://localhost:3004
VITE_APP_NAME=TranTxt
```

#### F. Start Frontend Server

```bash
cd D:\coding\vibe\trantxt\frontend

# Development mode with hot reload
npm run dev
```

Frontend will run on: **http://localhost:3005**

### Access Your Local App

- **Frontend**: http://localhost:3005
- **Backend API**: http://localhost:3004
- **Database**: PostgreSQL on port 5433

---

## Part 2: Server System Requirements

### Minimum Requirements (Budget)
```
CPU:    1 vCPU (2.0+ GHz)
RAM:    2 GB
Storage: 10 GB SSD
OS:     Linux (Ubuntu 20.04+, Debian 10+)
```

### Recommended Requirements (Production)
```
CPU:    2-4 vCPU
RAM:    4-8 GB
Storage: 20-50 GB SSD
OS:     Linux (Ubuntu 22.04 LTS)
Database: Separate PostgreSQL instance (4GB+ RAM)
```

### GCP e2-small Specifications
```
CPU:    2 vCPU (shared, not guaranteed)
RAM:    2 GB
Storage: 20 GB SSD (boot disk)
Network: Persistent static IP available
Cost:   ~$15-20/month
```

### ✅ e2-small IS Sufficient For:
- Small to medium user base (< 100 concurrent users)
- Development/staging environments
- Proof of concept
- Learning and testing

### ❌ e2-small is NOT Recommended For:
- Large production deployments (> 1000 users)
- High-traffic applications
- Video/audio processing
- Real-time collaborative features

### Performance Optimization for e2-small

1. **Enable swap memory** (2GB recommended)
2. **Use PostgreSQL on separate VM** (optional but recommended)
3. **Enable Nginx caching** (reduces backend load)
4. **Use Redis for session caching** (if needed)
5. **Monitor memory usage** (critical on 2GB)

---

## Part 3: Detailed .env Configuration

### Backend .env Explained

```env
# Server Configuration
PORT=3004                                    # Backend API port
NODE_ENV=development                         # development or production

# Database Configuration
DATABASE_URL=postgres://user:pass@localhost:5433/trantxt
# Format: postgres://[username]:[password]@[host]:[port]/[database]

# Authentication Keys (Generate with strong random values)
JWT_SECRET=your-long-random-string-here     # Used to sign JWT tokens
JWT_REFRESH_SECRET=another-long-random      # Used for refresh tokens

# Security/Encryption
ENCRYPTION_KEY=12345678901234567890123456   # Must be exactly 32 characters
# Use for AES-256 encryption of files

# File Upload Settings
FILE_UPLOAD_DIR=./uploads                   # Local directory for files
MAX_FILE_SIZE_MB=100                        # Maximum file size in MB

# Admin Default Credentials (Change after first login!)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!

# Frontend CORS Configuration
CORS_ORIGIN=http://localhost:3005           # Allow requests from frontend
# Production: https://yourdomain.com

# Logging
LOG_LEVEL=debug                             # debug, info, warn, error

# Optional: Translation API Keys
GOOGLE_TRANSLATE_API_KEY=your-key-here
DEEPL_API_KEY=your-key-here
AZURE_TRANSLATOR_KEY=your-key-here
```

### Frontend .env Explained

```env
# API URL (where backend is hosted)
VITE_API_URL=http://localhost:3004          # Point to backend

# App Name (optional)
VITE_APP_NAME=TranTxt
```

### How to Generate Secure Keys

#### PowerShell (Windows):
```powershell
# Generate 32-character random string
-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Run this 3 times to get JWT_SECRET, JWT_REFRESH_SECRET, ENCRYPTION_KEY
```

#### Linux/Mac:
```bash
# Generate 32-character random string
openssl rand -hex 16

# Or for printable characters
openssl rand -base64 24
```

### Production .env Example

```env
PORT=3004
NODE_ENV=production
DATABASE_URL=postgres://trantxt_user:SuperSecurePassword@db.example.com:5432/trantxt
JWT_SECRET=aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3
JWT_REFRESH_SECRET=wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4
ENCRYPTION_KEY=abcdefghijklmnopqrstuvwxyz123456
FILE_UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=ChangeThisPassword123!
CORS_ORIGIN=https://trantxt.company.com
LOG_LEVEL=info
GOOGLE_TRANSLATE_API_KEY=your-production-key
```

---

## Part 4: Custom Ports Configuration

### How to Change All Ports

#### 1. Backend Port (3004)

Edit `backend\.env`:
```env
PORT=3004  # Change to 3004, 8000, 8080, etc.
```

Then restart backend.

#### 2. PostgreSQL Port (5433)

##### Windows (Existing Installation):
```bash
# Edit PostgreSQL config file
# Location: C:\Program Files\PostgreSQL\14\data\postgresql.conf

# Find line: port = 5432
# Change to: port = 5433

# Restart PostgreSQL service
# Services app > PostgreSQL > Restart
```

Update `.env`:
```env
DATABASE_URL=postgres://user:pass@localhost:5433/trantxt
```

##### Linux (See Part 5 for GCP):
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Find: port = 5432
# Change: port = 5433
sudo systemctl restart postgresql
```

#### 3. Frontend Port (3005)

Edit `frontend\vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,  // Change here
    strictPort: false,
    open: true,
  },
})
```

Also update `backend\.env`:
```env
CORS_ORIGIN=http://localhost:3005  # Update to new frontend port
```

#### 4. Nginx Port (80/443 for Production)

Edit `nginx.conf`:
```nginx
server {
    listen 80;           # Change to 3005 or any port
    listen [::]:80;
    server_name _;
    # ... rest of config
}
```

### Complete Custom Port Example

```env
# backend/.env
PORT=3004

# frontend/.env
VITE_API_URL=http://localhost:3004

# postgresql.conf
port = 5433
```

Then access:
- Frontend: http://localhost:3005
- Backend: http://localhost:3004
- Database: localhost:5433

---

## Part 5: GCP e2-small Deployment Guide

### Step 1: Create GCP VM Instance

1. Go to https://console.cloud.google.com/
2. Create new project (if needed)
3. Go to **Compute Engine > VM Instances**
4. Click **Create Instance**

Settings:
```
Name: trantxt-app
Region: us-central1 (or closest to you)
Zone: us-central1-a
Machine Type: e2-small
CPU Platform: Intel Broadwell
Boot Disk: Ubuntu 22.04 LTS, 30GB SSD
```

5. Click **Create**

### Step 2: Configure Firewall

In GCP Console:
1. Go to **VPC Network > Firewall Rules**
2. Click **Create Firewall Rule**

Rules to create:
```
Rule 1: Allow HTTP/HTTPS
- Name: allow-http-https
- Ingress, Allow, Port: 80, 443

Rule 2: Allow Backend API
- Name: allow-backend-api
- Ingress, Allow, Port: 3004

Rule 3: Allow Frontend (optional)
- Name: allow-frontend
- Ingress, Allow, Port: 3005 (only for testing)
```

### Step 3: SSH into VM

```bash
# From Google Cloud Console, click SSH button
# Or use gcloud CLI
gcloud compute ssh trantxt-app --zone us-central1-a
```

### Step 4: Install Dependencies

```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Git
sudo apt install -y git

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2
```

### Step 5: Configure PostgreSQL on GCP VM

```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE trantxt;
CREATE USER trantxt_user WITH PASSWORD 'your-secure-password';
ALTER ROLE trantxt_user SET client_encoding TO 'utf8';
ALTER ROLE trantxt_user SET default_transaction_isolation TO 'read committed';
GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;
\q
EOF
```

### Step 6: Clone and Setup Application

```bash
# Create app directory
sudo mkdir -p /var/www/trantxt
sudo chown $USER:$USER /var/www/trantxt

# Clone your repository (or upload code)
cd /var/www/trantxt
git clone https://github.com/your-repo/trantxt.git
cd trantxt

# Setup Backend
cd backend
npm install
cp .env.example .env

# Edit .env for GCP
nano .env
```

Edit backend/.env for GCP:
```env
PORT=3004
NODE_ENV=production
DATABASE_URL=postgres://trantxt_user:your-secure-password@localhost:5432/trantxt
JWT_SECRET=generate-secure-random-string
JWT_REFRESH_SECRET=generate-another-secure-random
ENCRYPTION_KEY=exactly-32-characters-long!!!
FILE_UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeMe123!
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
```

### Step 7: Initialize Database

```bash
cd /var/www/trantxt/backend
npm run db:migrate
```

### Step 8: Build Backend

```bash
cd /var/www/trantxt/backend
npm run build
```

### Step 9: Setup Frontend

```bash
cd /var/www/trantxt/frontend
npm install
cp .env.example .env

# Edit .env
nano .env
```

Edit frontend/.env:
```env
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=TranTxt
```

### Step 10: Build Frontend

```bash
cd /var/www/trantxt/frontend
npm run build

# Copy to Nginx
sudo cp -r dist/* /var/www/html/
```

### Step 11: Start Backend with PM2

```bash
cd /var/www/trantxt/backend

# Start backend
pm2 start dist/index.js --name "trantxt-backend"

# Save PM2 config
pm2 save

# Enable PM2 on startup
pm2 startup
# Copy and run the command it shows
```

### Step 12: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace with:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    client_max_body_size 100M;
    
    # Frontend (React)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        expires 1h;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3004/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 13: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Update Nginx
sudo systemctl restart nginx
```

### Step 14: Enable Swap (Important for e2-small)

```bash
# Create 2GB swap file
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make permanent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 15: Monitor and Verify

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs trantxt-backend

# Check Nginx
sudo systemctl status nginx

# Monitor memory usage (critical for e2-small)
free -h
htop
```

### GCP Deployment Checklist

- ✅ Created VM instance (e2-small)
- ✅ Configured firewall rules (80, 443, 3004)
- ✅ Installed Node.js and PostgreSQL
- ✅ Created database and user
- ✅ Setup backend with PM2
- ✅ Configured Nginx reverse proxy
- ✅ Setup SSL certificates
- ✅ Built and deployed frontend
- ✅ Enabled swap memory
- ✅ Configured domain DNS
- ✅ Tested all endpoints

### Production GCP Configuration Example

```bash
# SSH into VM
gcloud compute ssh trantxt-app --zone us-central1-a

# Check status
pm2 status
systemctl status nginx
systemctl status postgresql

# View logs
pm2 logs trantxt-backend
tail -f /var/log/nginx/error.log
sudo tail -f /var/log/postgresql/postgresql.log

# Restart services
pm2 restart trantxt-backend
sudo systemctl restart nginx
```

---

## Part 6: Troubleshooting

### Backend Connection Issues
```bash
# Test PostgreSQL connection
psql -U trantxt_user -d trantxt -h localhost -p 5433

# Test backend API
curl http://localhost:3004/api/health

# Check backend logs
npm run dev  # See console output
```

### Frontend Not Loading
```bash
# Check frontend build
npm run build

# Check Nginx config
sudo nginx -t

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Database Migration Fails
```bash
# Drop and recreate (development only!)
npm run db:migrate --force

# Or reset manually
sudo -u postgres psql
DROP DATABASE trantxt;
CREATE DATABASE trantxt;
\q

# Then migrate again
npm run db:migrate
```

### Memory Issues on e2-small
```bash
# Check memory
free -h

# Monitor usage
htop

# Kill unnecessary processes
killall node  # Kill old node processes
pm2 kill     # Clear PM2
pm2 resurrect # Restart from saved config
```

---

## Summary

| Aspect | Value |
|--------|-------|
| Local Test | Windows + Node.js + PostgreSQL ✅ |
| Custom Port | Edit .env + config files ✅ |
| e2-small RAM | 2GB enough (with swap) ✅ |
| GCP Setup | ~30 minutes ✅ |
| Recommended | 2-4GB RAM production ✅ |

