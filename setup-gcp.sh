#!/bin/bash

# TranTxt - GCP Deployment Script for e2-small
# This script automates the setup on Google Cloud Platform VM

set -e

echo "========================================"
echo "  TranTxt - GCP Deployment Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root for some commands
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}[ERROR]${NC} This script must be run with sudo"
        exit 1
    fi
}

# Step 1: Update system
echo "[1/10] Updating system packages..."
sudo apt update
sudo apt upgrade -y
echo -e "${GREEN}[OK]${NC} System updated"
echo ""

# Step 2: Install Node.js
echo "[2/10] Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
echo -e "${GREEN}[OK]${NC} Node.js installed"
echo ""

# Step 3: Install PostgreSQL
echo "[3/10] Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo -u postgres psql --version
echo -e "${GREEN}[OK]${NC} PostgreSQL installed"
echo ""

# Step 4: Create PostgreSQL database and user
echo "[4/10] Creating PostgreSQL database..."
sudo -u postgres psql << EOF
CREATE DATABASE trantxt;
CREATE USER trantxt_user WITH PASSWORD 'GCPSecurePass123!';
ALTER ROLE trantxt_user SET client_encoding TO 'utf8';
ALTER ROLE trantxt_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE trantxt_user SET default_transaction_deferrable TO on;
ALTER ROLE trantxt_user SET default_transaction_read_only TO off;
ALTER ROLE trantxt_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE trantxt TO trantxt_user;
EOF
echo -e "${GREEN}[OK]${NC} Database created"
echo ""

# Step 5: Install additional dependencies
echo "[5/10] Installing additional packages..."
sudo apt install -y git nginx certbot python3-certbot-nginx
echo -e "${GREEN}[OK]${NC} Additional packages installed"
echo ""

# Step 6: Install PM2 globally
echo "[6/10] Installing PM2 process manager..."
sudo npm install -g pm2
pm2 -v
echo -e "${GREEN}[OK]${NC} PM2 installed"
echo ""

# Step 7: Create app directory
echo "[7/10] Setting up application directories..."
sudo mkdir -p /var/www/trantxt
sudo mkdir -p /var/uploads
sudo chown -R $USER:$USER /var/www/trantxt
sudo chown -R $USER:$USER /var/uploads
echo -e "${GREEN}[OK]${NC} Directories created"
echo ""

# Step 8: Clone repository (or use existing code)
echo "[8/10] Preparing application code..."
if [ ! -d "/var/www/trantxt/.git" ]; then
    echo "Enter your repository URL (or press Enter to skip):"
    read REPO_URL
    if [ ! -z "$REPO_URL" ]; then
        cd /var/www/trantxt
        git clone $REPO_URL .
    fi
fi
echo -e "${GREEN}[OK]${NC} Code prepared"
echo ""

# Step 9: Setup backend
echo "[9/10] Setting up backend..."
cd /var/www/trantxt/backend
npm install
npm run build

cat > .env << 'EOF'
PORT=3004
NODE_ENV=production
DATABASE_URL=postgres://trantxt_user:GCPSecurePass123!@localhost:5432/trantxt
JWT_SECRET=SampleJWTSecretKeyChangeInProduction12345
JWT_REFRESH_SECRET=SampleRefreshSecretKeyChangeInProduction54321
ENCRYPTION_KEY=SampleEncryptionKey32CharsExact!!
FILE_UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE_MB=100
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=ChangeThisAdminPassword123!
CORS_ORIGIN=https://your-domain.com
LOG_LEVEL=info
EOF

npm run db:migrate
echo -e "${GREEN}[OK]${NC} Backend setup complete"
echo ""

# Step 10: Setup frontend
echo "[10/10] Setting up frontend..."
cd /var/www/trantxt/frontend
npm install
npm run build

sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

cat > .env << 'EOF'
VITE_API_URL=https://your-domain.com/api
VITE_APP_NAME=TranTxt
EOF

echo -e "${GREEN}[OK]${NC} Frontend setup complete"
echo ""

# Setup Nginx configuration
echo "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    client_max_body_size 100M;
    
    # Frontend (React)
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }
    
    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/html;
        expires 365d;
        add_header Cache-Control "public, immutable";
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
        proxy_read_timeout 90;
    }
}
EOF

sudo nginx -t
sudo systemctl restart nginx
echo -e "${GREEN}[OK]${NC} Nginx configured"
echo ""

# Start backend with PM2
echo "Starting backend service..."
cd /var/www/trantxt/backend
pm2 start dist/index.js --name "trantxt-backend"
pm2 save
pm2 startup
echo -e "${GREEN}[OK]${NC} Backend started"
echo ""

# Enable swap (important for e2-small with 2GB RAM)
echo "Enabling swap memory..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}[OK]${NC} 2GB swap enabled"
else
    echo -e "${GREEN}[OK]${NC} Swap already exists"
fi
echo ""

# Setup SSL with Let's Encrypt
echo "Setup SSL Certificate:"
echo "Run this command to setup SSL (requires your domain):"
echo ""
echo "sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com"
echo ""

# Final status
echo "========================================"
echo -e "${GREEN}  Setup Complete!${NC}"
echo "========================================"
echo ""
echo "Application Status:"
pm2 status
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Next Steps:"
echo "1. Update domain in .env files"
echo "2. Setup SSL certificate (see above)"
echo "3. Configure DNS to point to this instance"
echo "4. Monitor logs: pm2 logs trantxt-backend"
echo ""
echo "Access application at: http://your-domain.com"
echo ""
