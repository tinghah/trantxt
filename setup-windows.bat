@echo off
REM TranTxt - Local Setup Script for Windows (PostgreSQL 18 Compatible)
REM This script helps setup the application locally without Docker

echo.
echo ========================================
echo   TranTxt - Local Setup Script
echo ========================================
echo.

REM Set PostgreSQL 18 path
set PGPATH=C:\Program Files\PostgreSQL\18\bin
set PSQL="%PGPATH%\psql.exe"

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: & node -v

REM Check if PostgreSQL 18 is installed
if not exist "%PGPATH%\psql.exe" (
    echo [ERROR] PostgreSQL is not installed at %PGPATH%!
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
echo [OK] PostgreSQL found: & %PSQL% --version

echo.
echo Step 1: Creating database and user...
REM Create database (this will prompt for password)
echo Please enter PostgreSQL postgres user password when prompted:
%PSQL% -U postgres -c "CREATE DATABASE trantxt;" 2>nul
%PSQL% -U postgres -c "CREATE USER trantxt_user WITH PASSWORD 'secure_password_123';" 2>nul
%PSQL% -U postgres -c "ALTER ROLE trantxt_user SET client_encoding TO 'utf8';" 2>nul
%PSQL% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;" 2>nul
echo [OK] Database created

echo.
echo Step 2: Setting up backend...
cd backend
call npm install
echo [OK] Backend dependencies installed

echo.
echo Step 3: Creating backend .env file...
(
echo PORT=3004
echo NODE_ENV=development
echo DATABASE_URL=postgres://trantxt_user:secure_password_123@localhost:5432/trantxt
echo JWT_SECRET=your-random-secret-key-min-32-characters-long-12345
echo JWT_REFRESH_SECRET=your-random-refresh-key-min-32-chars-longerr
echo ENCRYPTION_KEY=12345678901234567890123456789012
echo FILE_UPLOAD_DIR=./uploads
echo MAX_FILE_SIZE_MB=100
echo ADMIN_EMAIL=admin@example.com
echo ADMIN_PASSWORD=AdminPassword123!
echo CORS_ORIGIN=http://localhost:3005
echo LOG_LEVEL=debug
) > .env
echo [OK] .env file created

echo.
echo Step 4: Initializing database schema...
call npm run db:migrate
if errorlevel 1 (
    echo [ERROR] Database migration failed!
    echo Check that PostgreSQL is running and the password is correct.
    pause
    exit /b 1
)
echo [OK] Database initialized

cd ..

echo.
echo Step 5: Setting up frontend...
cd frontend
call npm install
echo [OK] Frontend dependencies installed

echo.
echo Step 6: Creating frontend .env file...
(
echo VITE_API_URL=http://localhost:3004
echo VITE_APP_NAME=TranTxt
) > .env
echo [OK] Frontend .env file created

cd ..

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm run dev
echo   Runs on: http://localhost:3004
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm run dev
echo   Runs on: http://localhost:3005
echo.
echo Access the app at: http://localhost:3005
echo.
echo Default admin credentials:
echo   Email: admin@example.com
echo   Password: AdminPassword123!
echo.
pause
