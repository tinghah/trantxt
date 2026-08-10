#!/bin/bash
set -e

echo "=== TranTxt Setup ==="

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Error: docker not found. Install Docker first."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "Error: docker compose not found."; exit 1; }

# Create .env files if missing
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env from example"
fi

if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
  echo "Created frontend/.env from example"
fi

# Build and start
echo "Building and starting services..."
docker compose up -d --build

echo ""
echo "=== Done ==="
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:3001"
echo "Login:    admin@example.com / AdminPassword123!"
echo ""
echo "Commands:"
echo "  docker compose logs -f     # View logs"
echo "  docker compose down        # Stop services"
echo "  docker compose ps          # Check status"
