# 🎯 MANUAL SETUP INSTRUCTIONS - You're Almost There!

**Status**: ✅ Git pushed to GitHub successfully!  
**PostgreSQL**: ✅ Running and verified  
**Next**: Complete the setup manually (takes 10 minutes)

---

## ⚠️ ISSUE: PostgreSQL Password Needed

The default PostgreSQL password during installation is usually one of:
- `postgres`
- The password YOU set during installation
- Empty (blank)

We need to verify your password first.

---

## 🔑 STEP 1: Verify/Reset PostgreSQL Password

**Option A: Try these common passwords:**

```bash
# Try password "postgres"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT version();"

# Try with no password (just press Enter when asked)
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT version();"

# Or try via Windows authentication (might work automatically)
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

**Option B: Reset the postgres user password:**

1. **Open Services app** (Press Win+R, type `services.msc`)
2. Find: **postgresql-x64-18**
3. Right-click → **Stop** (to stop the service)
4. Wait 5 seconds
5. Right-click → **Start** (to start it again)
6. This may reset to default or allow local connection

**Option C: Find the PostgreSQL password:**

Look for installation notes:
- Check your PostgreSQL installation email/download confirmation
- Check Desktop for PostgreSQL installation notes
- Check: `C:\Program Files (x86)\PostgreSQL\` for readme files

---

## 💾 STEP 2: Create Database Manually

Once you have the password, run these commands in PowerShell:

```powershell
# Set the password
$env:PGPASSWORD="YOUR_PASSWORD_HERE"

# Create database
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE trantxt;"

# Create user
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE USER trantxt_user WITH PASSWORD 'secure_password_123';"

# Grant permissions
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER ROLE trantxt_user SET client_encoding TO 'utf8';"
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;"

Write-Host "✅ Database setup complete!"
```

---

## 📦 STEP 3: Install Backend Dependencies

```bash
cd D:\coding\vibe\trantxt\backend
npm install
```

This will take 2-3 minutes. Once done, you should see no errors.

---

## ⚙️ STEP 4: Create Backend .env File

Create file: `D:\coding\vibe\trantxt\backend\.env`

```env
PORT=3004
NODE_ENV=development
DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5432/trantxt
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

---

## 🗄️ STEP 5: Run Database Migrations

```bash
cd D:\coding\vibe\trantxt\backend
npm run db:migrate
```

Should complete without errors.

---

## 📦 STEP 6: Install Frontend Dependencies

```bash
cd D:\coding\vibe\trantxt\frontend
npm install
```

---

## 🎨 STEP 7: Create Frontend .env File

Create file: `D:\coding\vibe\trantxt\frontend\.env`

```env
VITE_API_URL=http://localhost:3004
VITE_APP_NAME=TranTxt
```

---

## 🚀 STEP 8: Start Backend

**Open Terminal 1:**

```bash
cd D:\coding\vibe\trantxt\backend
npm run dev
```

**Expected output:**
```
Server running on port 3004
Connected to database
```

---

## 🎨 STEP 9: Start Frontend

**Open Terminal 2:**

```bash
cd D:\coding\vibe\trantxt\frontend
npm run dev
```

**Expected output:**
```
Local: http://localhost:3005
```

---

## 🌐 STEP 10: Access Your App

Open browser: `http://localhost:3005`

**Login:**
```
Email: admin@example.com
Password: AdminPassword123!
```

---

## 📋 QUICK CHECKLIST

After each step, check:

| Step | Command | Check For |
|------|---------|-----------|
| 1 | PostgreSQL password | Connection successful |
| 2 | Database creation | No errors shown |
| 3 | `npm install` (backend) | Completes successfully |
| 4 | Create .env (backend) | File exists at backend/.env |
| 5 | `npm run db:migrate` | Migrations complete |
| 6 | `npm install` (frontend) | Completes successfully |
| 7 | Create .env (frontend) | File exists at frontend/.env |
| 8 | Backend start | "Server running on port 3004" |
| 9 | Frontend start | "Local: http://localhost:3005" |
| 10 | Browser access | Page loads |

---

## 🆘 TROUBLESHOOTING

### Can't find PostgreSQL password:

```bash
# Try resetting it
# Open PowerShell as Administrator
# Stop service
Stop-Service -Name "postgresql-x64-18"

# Start service
Start-Service -Name "postgresql-x64-18"

# Try connecting with blank password
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
# Just press Enter when asked for password
```

### npm install fails:

```bash
npm cache clean --force
npm install
```

### Port already in use:

Change PORT in backend/.env to 3005, 8000, or 8080

### Database migration fails:

```bash
# Check database exists
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U trantxt_user -d trantxt
# Type password: secure_password_123
# Then: \q to exit
```

---

## 📊 YOUR PROGRESS

```
✅ Git: Pushed to GitHub
✅ PostgreSQL: Running on port 5432
✅ Code: All committed and ready
⏳ Database: Need password to create
⏳ Dependencies: Ready to install
⏳ .env files: Ready to create
⏳ Backend: Ready to start
⏳ Frontend: Ready to start
```

---

## ⏱️ TIME ESTIMATE

- Find/verify PostgreSQL password: 5 minutes
- Database setup: 2 minutes
- Dependencies: 5 minutes
- .env files: 2 minutes
- Database migrations: 2 minutes
- Start backend & frontend: 2 minutes
- **TOTAL: ~20 minutes**

---

## 🎉 WHEN DONE

You'll have:
- ✅ Full-stack application running locally
- ✅ Backend API on http://localhost:3004
- ✅ Frontend on http://localhost:3005
- ✅ PostgreSQL database connected
- ✅ All code in GitHub
- ✅ Ready for deployment

---

**Let me know what PostgreSQL password you'd like to use or if you need help finding it!**
