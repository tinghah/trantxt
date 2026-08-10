# TranTxt Setup Script
$ErrorActionPreference = "Stop"

Write-Host "=== TranTxt Setup ===" -ForegroundColor Cyan

# Check prerequisites
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "Error: docker not found. Install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Create .env files if missing
if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "Created backend\.env from example" -ForegroundColor Green
}

if (-not (Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "Created frontend\.env from example" -ForegroundColor Green
}

# Build and start
Write-Host "Building and starting services..." -ForegroundColor Yellow
docker compose up -d --build

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:3001"
Write-Host "Login:    admin@example.com / AdminPassword123!"
Write-Host ""
Write-Host "Commands:"
Write-Host "  docker compose logs -f     # View logs"
Write-Host "  docker compose down        # Stop services"
Write-Host "  docker compose ps          # Check status"
