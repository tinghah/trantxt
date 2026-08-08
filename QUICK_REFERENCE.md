# TranTxt - Quick Reference Guide
## Answers to Your Questions

---

## ❓ Question 1: Can I Test Locally Without Docker Desktop in Windows?

### ✅ YES! Absolutely.

**What You Need:**
- Node.js 18+ (not Docker)
- PostgreSQL (standalone installer)
- Git (optional)

**Setup Time:** ~15 minutes

### Quick Setup Steps:

1. **Install PostgreSQL** (standalone for Windows)
   - Download: https://www.postgresql.org/download/windows/
   - During install, remember the password you set
   - Default port: 5432

2. **Create Database**
   ```bash
   psql -U postgres
   # Enter password from installation
   
   # Then paste these commands:
   CREATE DATABASE trantxt;
   CREATE USER trantxt_user WITH PASSWORD 'secure_password_123';
   GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;
   \q
   ```

3. **Start Backend**
   ```bash
   cd D:\coding\vibe\trantxt\backend
   npm install
   npm run db:migrate
   npm run dev
   # Runs on http://localhost:3004
   ```

4. **Start Frontend** (New Terminal)
   ```bash
   cd D:\coding\vibe\trantxt\frontend
   npm install
   npm run dev
   # Runs on http://localhost:3005
   ```

**That's it!** No Docker needed. Access at http://localhost:3005

---

## ❓ Question 2: Server System Requirements?

### Minimum (Budget Setup)
```
CPU:     1 vCPU @ 2.0+ GHz
RAM:     2 GB
Storage: 10-20 GB SSD
OS:      Ubuntu 20.04+ or Debian 10+
```
✓ Good for: Development, small teams, staging

### Recommended (Production)
```
CPU:     2-4 vCPU
RAM:     4-8 GB
Storage: 30-50 GB SSD
OS:      Ubuntu 22.04 LTS
Database: Separate DB server (optional, 4GB+)
```
✓ Good for: Production, 100+ concurrent users

### Google GCP e2-small
```
CPU:     2 vCPU (shared - burst capable)
RAM:     2 GB
Storage: 20-30 GB SSD
Cost:    ~$15-20/month
```
✅ **YES, e2-small is ENOUGH** for TranTxt because:
- Application is lightweight (~15MB compiled)
- Node.js + Express efficient
- PostgreSQL ~5-10MB
- With 2GB swap, handles well

⚠️ **Recommendations for e2-small:**
- Enable 2GB swap memory (this is critical)
- Monitor memory usage regularly
- For production > 1000 users, upgrade to e2-medium (4GB)

---

## ❓ Question 3: What's Needed for .env Setup?

### Backend .env - Development
```env
PORT=3004
NODE_ENV=development
DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5432/trantxt
JWT_SECRET=GenerateRandomString32CharactersLong!!!
JWT_REFRESH_SECRET=AnotherRandomString32CharactersLong!!!
ENCRYPTION_KEY=12345678901234567890123456789012
FILE_UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123!
CORS_ORIGIN=http://localhost:3005
LOG_LEVEL=debug
```

**What Each Variable Does:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Backend server port | 3004 |
| `DATABASE_URL` | How to connect to PostgreSQL | postgres://user:pass@localhost:5432/db |
| `JWT_SECRET` | Secret for auth tokens (keep safe!) | Random 32+ char string |
| `ENCRYPTION_KEY` | Encrypts files (MUST be 32 chars exactly) | abcdefghijklmnopqrstuvwxyz123456 |
| `ADMIN_EMAIL` | Default admin login email | admin@example.com |
| `CORS_ORIGIN` | Frontend domain allowed to call API | http://localhost:3005 |

### Frontend .env - Development
```env
VITE_API_URL=http://localhost:3004
VITE_APP_NAME=TranTxt
```

### How to Generate Random Keys

**PowerShell (Windows):**
```powershell
# Run this and copy the output
-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Run 3 times to get 3 different keys
```

**Linux/Mac:**
```bash
openssl rand -base64 24
# Run 3 times
```

**Or use online:** https://www.random.org/strings/
- Generate 3 strings, 32 characters each

### Files to Create:
1. `backend/.env` - Backend configuration
2. `frontend/.env` - Frontend configuration
3. **Add `.env` to `.gitignore`** - Never commit secrets to Git!

---

## ❓ Question 4: How to Deploy on GCP e2-small?

### Step-by-Step (20-30 minutes)

#### 1. Create GCP VM Instance
```
Go to: console.cloud.google.com
Compute Engine > VM Instances > Create Instance

Settings:
- Name: trantxt-app
- Machine Type: e2-small (2 vCPU, 2GB RAM)
- Boot Disk: Ubuntu 22.04 LTS, 30GB
- Region: us-central1 (or closest to you)
```

#### 2. Configure Firewall
```
VPC Network > Firewall Rules > Create

Allow these ports:
- Port 80 (HTTP)
- Port 443 (HTTPS)
- Port 3004 (Backend API - optional, for testing)
```

#### 3. SSH into VM
```bash
# Click SSH button in Google Cloud Console
# Or use:
gcloud compute ssh trantxt-app --zone us-central1-a
```

#### 4. Run Setup Script
```bash
# Copy the setup script to your VM and run it
chmod +x setup-gcp.sh
./setup-gcp.sh

# This automatically:
# - Installs Node.js, PostgreSQL, Nginx
# - Creates database
# - Sets up backend & frontend
# - Configures reverse proxy
# - Enables SSL
# - Starts services
```

#### 5. Update Your Domain
```
Go to your domain registrar
Update DNS A record to point to GCP instance IP
Wait 5-15 minutes for DNS to propagate
```

#### 6. Enable SSL Certificate
```bash
sudo certbot certonly --standalone -d your-domain.com
# This creates free SSL certificate (Let's Encrypt)
```

#### 7. Access Your Application
```
https://your-domain.com
Backend API: https://your-domain.com/api
```

**That's it!** Your app is live on GCP.

---

## ❓ Question 5: Can I Change Specific Ports?

### ✅ YES! Full Custom Port Support

#### PostgreSQL Port (Default: 5432)

**Windows:**
1. Open PostgreSQL config: `C:\Program Files\PostgreSQL\14\data\postgresql.conf`
2. Find: `port = 5432`
3. Change to: `port = 5433`
4. Restart PostgreSQL service
5. Update backend .env: `DATABASE_URL=postgres://user:pass@localhost:5433/trantxt`

**Linux/GCP:**
```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
# Find: port = 5432
# Change: port = 5433
sudo systemctl restart postgresql
```

#### Backend Port (Default: 3004)

Edit `backend/.env`:
```env
PORT=3004  # Change to any port like 8080, 5000, etc.
```

Update `frontend/.env`:
```env
VITE_API_URL=http://localhost:3004  # Update to match
```

#### Frontend Port (Default: 3005)

Edit `frontend/vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,  // Change here to any port
  },
})
```

Update `backend/.env`:
```env
CORS_ORIGIN=http://localhost:3005  # Update to match
```

### Example: Custom Ports (5433, 3004, 3005)

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

Then start normally:
```bash
# Backend: npm run dev (runs on 3004)
# Frontend: npm run dev (runs on 3005)
# Database: on 5433
```

---

## 🚀 Quick Start Checklist

### Local Windows Testing
- [ ] Install Node.js 18+
- [ ] Install PostgreSQL (standalone)
- [ ] Create database and user
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Run `npm install` in backend
- [ ] Run `npm run db:migrate` in backend
- [ ] Run `npm run dev` in backend (Terminal 1)
- [ ] Run `npm run dev` in frontend (Terminal 2)
- [ ] Access http://localhost:3005

### GCP Deployment
- [ ] Create e2-small VM instance
- [ ] Configure firewall (ports 80, 443)
- [ ] SSH into VM
- [ ] Download and run `setup-gcp.sh`
- [ ] Configure custom ports (if needed)
- [ ] Point domain DNS to GCP IP
- [ ] Setup SSL certificate
- [ ] Access https://your-domain.com

---

## 📊 Resource Comparison

| Aspect | Windows Local | GCP e2-small |
|--------|---------------|-------------|
| Setup Time | 15 mins | 30 mins |
| Cost | Free | ~$15/month |
| Performance | Excellent | Good (2GB RAM) |
| Multiple Users | Limited | 100+ |
| Uptime | Depends on PC | 99.5%+ |
| Complexity | Simple | Medium |
| For Testing | ✅ Perfect | ✅ Perfect |
| For Production | ❌ No | ✅ Yes |

---

## 💡 Pro Tips

### Windows Local Development
1. Use separate terminals for backend and frontend
2. Keep PostgreSQL running in background
3. Monitor with: `npm run dev` (shows errors live)
4. Test database: `psql -U postgres` then `\l` (list databases)

### GCP Deployment
1. Enable swap memory (critical for 2GB)
   ```bash
   sudo fallocate -l 2G /swapfile
   sudo swapon /swapfile
   ```

2. Monitor memory usage
   ```bash
   free -h
   htop
   ```

3. Check logs
   ```bash
   pm2 logs trantxt-backend
   tail -f /var/log/nginx/error.log
   ```

4. Use screen or tmux for persistent sessions
   ```bash
   screen -S trantxt
   # Run commands
   # Ctrl+A then D to detach
   screen -r trantxt  # Reattach later
   ```

---

## 🔐 Security Reminders

### Before Going Live
- ✅ Change default admin password
- ✅ Generate strong random keys (32+ chars)
- ✅ Use HTTPS/SSL (Let's Encrypt free)
- ✅ Update CORS_ORIGIN to your domain
- ✅ Set NODE_ENV=production
- ✅ Never commit .env to Git
- ✅ Use strong database passwords
- ✅ Enable firewall rules (only allow needed ports)
- ✅ Monitor logs for errors
- ✅ Setup regular backups

---

## 📞 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| "Port 3004 already in use" | Change PORT in .env to different port |
| "Can't connect to database" | Check DATABASE_URL format, verify PostgreSQL running |
| "CORS error in frontend" | Update CORS_ORIGIN in .env to match frontend URL |
| "ENCRYPTION_KEY must be 32 chars" | Generate exactly 32 character string |
| "Out of memory on GCP" | Enable swap, or upgrade to e2-medium (4GB) |
| "Frontend shows blank page" | Check console for errors, verify VITE_API_URL |
| "Database won't start" | Check PostgreSQL service is running: `systemctl status postgresql` |
| "SSL certificate error" | Run: `sudo certbot certonly --standalone -d yourdomain.com` |

---

## 📚 Helpful Documents

In your `trantxt/` directory:
- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `ENV_SETUP_GUIDE.md` - Detailed .env configuration
- `README.md` - API documentation
- `PLAN.md` - Complete architecture
- `setup-windows.bat` - Auto setup for Windows
- `setup-gcp.sh` - Auto setup for GCP

---

## 🎯 Next Steps

### For Local Testing:
1. Read: `ENV_SETUP_GUIDE.md`
2. Run: `setup-windows.bat` (auto-setup)
3. Or manual setup: Follow "Local Windows Testing" checklist above

### For GCP Deployment:
1. Create GCP e2-small instance
2. SSH into VM
3. Run: `setup-gcp.sh` (auto-setup)
4. Configure domain DNS
5. Enable SSL

### Custom Ports:
1. Edit `.env` files to change ports
2. Edit `vite.config.ts` for frontend port
3. Update PostgreSQL config for DB port
4. Update all connection strings to match

---

## 📋 Summary

| Question | Answer |
|----------|--------|
| Test locally without Docker? | ✅ Yes, with Node.js + PostgreSQL only |
| Server requirements? | ✅ 2GB RAM minimum (e2-small works!) |
| .env setup? | ✅ See ENV_SETUP_GUIDE.md (provided) |
| Deploy on GCP e2-small? | ✅ Yes, run setup-gcp.sh |
| Change ports? | ✅ Yes, fully customizable |

**Everything is ready to go!** 🚀

