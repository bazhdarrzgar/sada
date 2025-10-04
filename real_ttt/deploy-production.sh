#!/bin/bash

# SADA Project Production Deployment Script
# This script sets up the application for production deployment

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[PROD]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo
echo -e "${GREEN}🚀 SADA Production Deployment${NC}"
echo

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the SADA project root directory"
    exit 1
fi

# Check environment
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found. Please create it first."
    exit 1
fi

# Install production dependencies
print_status "Installing production dependencies..."
NODE_ENV=production yarn install --frozen-lockfile

# Build the application
print_status "Building application for production..."
yarn build

# Set up PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sada-app',
    script: 'yarn',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=2048'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Set up Nginx configuration
if command -v nginx >/dev/null 2>&1; then
    print_status "Setting up Nginx configuration..."
    
    sudo tee /etc/nginx/sites-available/sada << 'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Serve static files directly
    location /_next/static/ {
        alias /path/to/your/project/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /uploads/ {
        alias /path/to/your/project/public/uploads/;
        expires 1d;
        add_header Cache-Control "public";
    }
}
EOF
    
    # Update the paths in nginx config
    PROJECT_PATH=$(pwd)
    sudo sed -i "s|/path/to/your/project|$PROJECT_PATH|g" /etc/nginx/sites-available/sada
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/sada /etc/nginx/sites-enabled/sada
    sudo nginx -t && sudo systemctl reload nginx
    
    print_success "Nginx configuration created and enabled"
fi

# Start/restart the application with PM2
print_status "Starting application with PM2..."
pm2 delete sada-app 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Set up log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/sada << 'EOF'
/path/to/your/project/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

# Update the path in logrotate config
PROJECT_PATH=$(pwd)
sudo sed -i "s|/path/to/your/project|$PROJECT_PATH|g" /etc/logrotate.d/sada

print_success "Production deployment completed!"
echo
echo -e "${GREEN}📊 Application Status:${NC}"
pm2 list
echo
echo -e "${GREEN}🌐 Application URLs:${NC}"
echo -e "${BLUE}Local: http://localhost:3000${NC}"
if command -v nginx >/dev/null 2>&1; then
    echo -e "${BLUE}Nginx: http://$(hostname -I | awk '{print $1}')${NC}"
fi
echo
echo -e "${GREEN}📝 Useful Commands:${NC}"
echo -e "${BLUE}pm2 list${NC}          - List running applications"
echo -e "${BLUE}pm2 restart sada-app${NC} - Restart the application"
echo -e "${BLUE}pm2 logs sada-app${NC}    - View application logs"
echo -e "${BLUE}pm2 monit${NC}         - Monitor applications"
echo