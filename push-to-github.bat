@echo off
REM TranTxt - Push to GitHub Helper Script
REM This script helps push your code to GitHub with token authentication

echo.
echo ========================================
echo   TranTxt - GitHub Push Helper
echo ========================================
echo.

echo To push your code to GitHub, you need to authenticate.
echo.
echo Choose your authentication method:
echo.
echo 1. Personal Access Token (Easiest)
echo 2. SSH Key (Most Secure)
echo 3. GitHub CLI (If installed)
echo.
set /p choice="Enter your choice (1-3): "

if "%choice%"=="1" (
    goto TOKEN_METHOD
) else if "%choice%"=="2" (
    goto SSH_METHOD
) else if "%choice%"=="3" (
    goto CLI_METHOD
) else (
    echo [ERROR] Invalid choice
    pause
    exit /b 1
)

:TOKEN_METHOD
echo.
echo ========================================
echo   Using Personal Access Token
echo ========================================
echo.
echo Step 1: Create Token on GitHub
echo   - Go to: https://github.com/settings/tokens/new
echo   - Token name: TranTxt
echo   - Expiration: 90 days
echo   - Scopes: Check "repo" checkbox
echo   - Click "Generate token"
echo.
echo Step 2: Copy your token and paste it when prompted below
echo.
echo Pushing to GitHub...
cd /d D:\coding\vibe\trantxt
git push -u origin main
if errorlevel 1 (
    echo [ERROR] Push failed!
    echo If authentication failed, use SSH instead (see other methods)
    pause
    exit /b 1
)
echo [OK] Code pushed to GitHub successfully!
echo Visit: https://github.com/tinghah/trantxt
pause
goto END

:SSH_METHOD
echo.
echo ========================================
echo   Using SSH Key
echo ========================================
echo.
echo Step 1: Generate SSH Key (if not already done)
echo %USERPROFILE%\.ssh\id_ed25519.pub
echo.
if not exist "%USERPROFILE%\.ssh\id_ed25519.pub" (
    echo Generating SSH key...
    ssh-keygen -t ed25519 -C "tinghah@github.com"
)
echo.
echo Step 2: Add to GitHub
echo   - Go to: https://github.com/settings/ssh/new
echo   - Open and copy: %USERPROFILE%\.ssh\id_ed25519.pub
echo   - Paste in GitHub SSH keys
echo.
echo Updating remote to SSH...
cd /d D:\coding\vibe\trantxt
git remote set-url origin git@github.com:tinghah/trantxt.git
echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
    echo [ERROR] SSH push failed!
    echo Make sure your SSH key is added to GitHub
    pause
    exit /b 1
)
echo [OK] Code pushed to GitHub successfully!
echo Visit: https://github.com/tinghah/trantxt
pause
goto END

:CLI_METHOD
echo.
echo ========================================
echo   Using GitHub CLI
echo ========================================
echo.
echo Checking if GitHub CLI is installed...
gh --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] GitHub CLI not found!
    echo Install from: https://cli.github.com/
    pause
    exit /b 1
)
echo.
echo Authenticating with GitHub...
gh auth login
echo.
echo Pushing to GitHub...
cd /d D:\coding\vibe\trantxt
git push -u origin main
if errorlevel 1 (
    echo [ERROR] Push failed!
    pause
    exit /b 1
)
echo [OK] Code pushed to GitHub successfully!
echo Visit: https://github.com/tinghah/trantxt
pause
goto END

:END
echo.
echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. Add PostgreSQL to PATH (if not done)
echo 2. Run: setup-windows.bat
echo 3. Start backend: npm run dev
echo 4. Start frontend: npm run dev
echo 5. Access: http://localhost:3005
echo.
pause
