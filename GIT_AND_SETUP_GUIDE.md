# Git & GitHub Setup Guide + Setup Script Fix

## Step 1: Push to GitHub (Choose One Option)

### Option A: Using Personal Access Token (Recommended - Easiest)

1. **Create GitHub Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" (classic)
   - Give it a name: "TranTxt"
   - Select scopes: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you'll use it in next step)

2. **Push using Token**:
   ```bash
   cd D:\coding\vibe\trantxt
   git push -u origin main
   # When prompted for password, paste your token
   ```

### Option B: Using SSH Key (More Secure)

1. **Generate SSH Key**:
   ```bash
   ssh-keygen -t ed25519 -C "tinghah@github.com"
   # Press Enter for all prompts (uses default location)
   ```

2. **Add to GitHub**:
   - Go to: https://github.com/settings/ssh/new
   - Copy content from: `C:\Users\[YourUsername]\.ssh\id_ed25519.pub`
   - Paste in GitHub
   - Click "Add SSH key"

3. **Change remote to SSH and push**:
   ```bash
   cd D:\coding\vibe\trantxt
   git remote set-url origin git@github.com:tinghah/trantxt.git
   git push -u origin main
   ```

### Option C: Using Git Credential Manager (Easiest - If installed)

If you have Git Credential Manager installed (comes with recent Git):
```bash
cd D:\coding\vibe\trantxt
git push -u origin main
# It will open browser for GitHub login
```

---

## Step 2: Fix PostgreSQL PATH (Required for setup-windows.bat)

Run this in PowerShell as Administrator:

```powershell
# Add PostgreSQL to system PATH permanently
[Environment]::SetEnvironmentVariable(
    "Path",
    [Environment]::GetEnvironmentVariable("Path", "User") + ";C:\Program Files\PostgreSQL\18\bin",
    "User"
)

# Verify
Write-Host "✅ PostgreSQL added to PATH"
Write-Host "Please close and reopen PowerShell for changes to take effect"
```

Then **close and reopen PowerShell**, then test:
```bash
psql --version
# Should show: psql (PostgreSQL) 18.1
```

---

## Step 3: Create PostgreSQL Superuser Password

The setup script needs to connect to PostgreSQL. Let's verify your PostgreSQL password:

```bash
# Test connection with default postgres user
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT version();"
```

You'll be prompted for the password you set during PostgreSQL installation.

If you forgot the password, you can reset it:
```bash
# This works without password on Windows if PostgreSQL is freshly installed
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER postgres WITH PASSWORD 'NewPassword123';"
```

---

## Step 4: Fix & Run setup-windows.bat

Before running the script, let me create a fixed version that works with PostgreSQL 18:

