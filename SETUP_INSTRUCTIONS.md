# Complete Guide: Git Push + Run Setup Script

## ✅ WHAT'S BEEN DONE

1. ✅ Git repository initialized
2. ✅ All files committed (102 files)
3. ✅ setup-windows.bat fixed for PostgreSQL 18
4. ⏳ Waiting: Push to GitHub (needs authentication)

---

## 🚀 STEP 1: Push to GitHub (Choose Your Method)

### Method 1: Using GitHub CLI (EASIEST - If installed)

```bash
# You may have GitHub CLI installed
gh auth login
# Follow prompts to authenticate

cd D:\coding\vibe\trantxt
git push -u origin main
```

### Method 2: Using Personal Access Token (RECOMMENDED)

**Create Token on GitHub:**
1. Go to: https://github.com/settings/tokens/new
2. Fill in:
   - Token name: `TranTxt`
   - Expiration: 90 days (or longer)
3. Select scopes: Check `repo` ✓
4. Click "Generate token"
5. **COPY the token** (you won't see it again)

**Then push:**
```bash
cd D:\coding\vibe\trantxt
git push -u origin main

# When prompted:
# Username: tinghah
# Password: [paste your token here]
```

### Method 3: Using SSH Key (MOST SECURE)

**Generate SSH Key:**
```bash
ssh-keygen -t ed25519 -C "tinghah@github.com"
# Press Enter for all prompts
```

**Add to GitHub:**
1. Go to: https://github.com/settings/ssh/new
2. Open file: `C:\Users\YourUsername\.ssh\id_ed25519.pub`
3. Copy entire content
4. Paste in GitHub
5. Click "Add SSH key"

**Push via SSH:**
```bash
cd D:\coding\vibe\trantxt
git remote set-url origin git@github.com:tinghah/trantxt.git
git push -u origin main
```

---

## 🔧 STEP 2: Setup PostgreSQL PATH (IMPORTANT!)

Run this **PowerShell as Administrator**:

```powershell
# Add PostgreSQL 18 to system PATH
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\PostgreSQL\18\bin",
    "User"
)

Write-Host "✅ PostgreSQL added to system PATH"
```

**Then close PowerShell completely and reopen it.**

Verify it works:
```bash
psql --version
# Should show: psql (PostgreSQL) 18.1
```

---

## 🗄️ STEP 3: Run setup-windows.bat

### Before Running:

You need to know your PostgreSQL **postgres** user password (the password you set during PostgreSQL installation).

If you forgot it:
```bash
# Reset it using Windows built-in authentication
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'NewPassword123';"
```

### Now Run Setup:

Double-click: `D:\coding\vibe\trantxt\setup-windows.bat`

Or from PowerShell:
```bash
cd D:\coding\vibe\trantxt
.\setup-windows.bat
```

**When prompted for password, enter your PostgreSQL postgres user password.**

The script will:
1. ✅ Create database `trantxt`
2. ✅ Create user `trantxt_user`
3. ✅ Install backend dependencies
4. ✅ Create backend .env
5. ✅ Run database migrations
6. ✅ Install frontend dependencies
7. ✅ Create frontend .env

---

## ✅ AFTER SETUP RUNS

### Start Backend (Terminal 1):
```bash
cd D:\coding\vibe\trantxt\backend
npm run dev
# Should show: Server running on port 3004
```

### Start Frontend (Terminal 2):
```bash
cd D:\coding\vibe\trantxt\frontend
npm run dev
# Should show: Local: http://localhost:3005
```

### Access Application:
```
http://localhost:3005
```

**Login with:**
- Email: `admin@example.com`
- Password: `AdminPassword123!`

---

## 🆘 TROUBLESHOOTING

### "psql not found" during setup
```bash
# Make sure you closed and reopened PowerShell after adding to PATH
# Or run with full path:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" --version
```

### "Authentication failed for Git"
- Use Personal Access Token (Method 2 above)
- Or SSH Key (Method 3 above)
- Or GitHub CLI (Method 1 above)

### "Database migration fails"
```bash
# Check if PostgreSQL is running:
# Services app > PostgreSQL > should show "Running"

# Test connection:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT version();"
```

### "npm install fails"
```bash
# Clear cache and retry:
npm cache clean --force
npm install
```

### Port 3004 or 3005 already in use
```bash
# Find what's using the port:
netstat -ano | findstr :3004
# Kill the process:
taskkill /PID [PID] /F
```

---

## 📋 QUICK REFERENCE

| Step | Command | Expected Result |
|------|---------|-----------------|
| 1 | `git push -u origin main` | Code pushed to GitHub ✅ |
| 2 | Add PostgreSQL to PATH | `psql --version` works ✅ |
| 3 | `setup-windows.bat` | Database created, deps installed ✅ |
| 4 | `npm run dev` (backend) | Server on port 3004 ✅ |
| 5 | `npm run dev` (frontend) | App on http://localhost:3005 ✅ |

---

## 📞 IF YOU NEED HELP

### Git Push Issues:
- See "STEP 1: Push to GitHub" above

### PostgreSQL Issues:
- Path not found → Add to PATH (STEP 2)
- Password forgotten → Reset password (see above)
- Service not running → Restart PostgreSQL service

### Setup Script Issues:
- Run with full path: `D:\coding\vibe\trantxt\setup-windows.bat`
- Check PostgreSQL running
- Verify postgres user password

### App Won't Start:
- Check backend/frontend .env files created
- Check ports not in use
- Check npm install completed

---

## ✨ YOU'RE READY!

1. **Push to GitHub** using Method 1, 2, or 3
2. **Add PostgreSQL to PATH** (close/reopen PowerShell)
3. **Run setup-windows.bat**
4. **Start backend & frontend**
5. **Access http://localhost:3005**

**All set!** 🚀

