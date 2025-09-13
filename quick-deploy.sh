#!/bin/bash

##############################################################################
# SADA - Quick Production Deployment Script
# Simplified version for immediate deployment with comprehensive dependencies
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_NAME="sada"
REPO_URL="https://github.com/bazhdarrzgar/sada.git"

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Function to install essential dependencies
install_essentials() {
    print_status "Installing essential dependencies..."
    
    # Update system
    sudo apt-get update
    sudo apt-get upgrade -y
    
    # Install basic tools
    sudo apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        build-essential \
        htop \
        vim
    
    # Install Node.js LTS
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js LTS..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    
    # Install Yarn
    if ! command -v yarn &> /dev/null; then
        print_status "Installing Yarn..."
        curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
        echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
        sudo apt-get update
        sudo apt-get install -y yarn
    fi
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        sudo usermod -aG docker $USER
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Test Docker installation
        if sudo docker run hello-world >/dev/null 2>&1; then
            print_success "Docker installed and verified successfully."
        else
            print_error "Docker installation failed."
            exit 1
        fi
    else
        print_success "Docker is already installed."
    fi
    
    # Install Docker Compose standalone
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
        sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    fi
    
    # Install MongoDB shell for database management
    if ! command -v mongosh &> /dev/null; then
        print_status "Installing MongoDB Shell..."
        wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-mongosh
    fi
    
    print_success "Essential dependencies installed successfully!"
}

# Function to optimize system for low memory
optimize_for_low_memory() {
    print_status "Optimizing system for low memory VPS..."
    
    # Create swap if doesn't exist
    if [ ! -f /swapfile ]; then
        print_status "Creating 1GB swap file..."
        sudo fallocate -l 1G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
        sudo sysctl -p
    fi
    
    # Configure Docker for low memory
    sudo mkdir -p /etc/docker
    cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "max-concurrent-downloads": 2,
    "max-concurrent-uploads": 2
}
EOF
    
    sudo systemctl restart docker
    print_success "System optimized for low memory."
}

echo "🚀 SADA Quick Deployment for Production VPS"
echo "============================================"

# Install all dependencies first
install_essentials
optimize_for_low_memory

# Clone or update repository
if [ -d "$PROJECT_NAME" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_NAME
    git pull origin main
else
    print_status "Cloning repository..."
    git clone $REPO_URL $PROJECT_NAME
    cd $PROJECT_NAME
fi

# Create optimized environment file
print_status "Creating production environment..."
MONGO_PASSWORD=$(openssl rand -base64 32)

cat << EOF > .env.production
NODE_ENV=production
MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/sada?authSource=admin
MONGO_URL=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/sada?authSource=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
NEXT_TELEMETRY_DISABLED=1
DOCKER_ENV=true
EOF

# Create memory-optimized docker-compose
print_status "Creating optimized Docker configuration..."
cat << EOF > docker-compose.quick.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: sada_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: sada
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD}
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - sada_network
    deploy:
      resources:
        limits:
          memory: 300m
        reservations:
          memory: 200m
    command: >
      mongod 
      --auth 
      --wiredTigerCacheSizeGB=0.15
      --maxConns=50
      --slowOpThresholdMs=2000
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'db.adminCommand(\"ping\")' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  app:
    build: .
    container_name: sada_app
    restart: unless-stopped
    env_file: .env.production
    environment:
      - NODE_OPTIONS=--max-old-space-size=400
    ports:
      - "3000:3000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - sada_network
    volumes:
      - upload_data:/app/public/upload
    deploy:
      resources:
        limits:
          memory: 450m
        reservations:
          memory: 300m
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

volumes:
  mongodb_data:
  upload_data:

networks:
  sada_network:
    driver: bridge
EOF

# Deploy application
print_status "Deploying application..."
docker-compose -f docker-compose.quick.yml --env-file .env.production down 2>/dev/null || true
docker-compose -f docker-compose.quick.yml --env-file .env.production up -d --build

# Wait for services
print_status "Waiting for services to start..."
sleep 45

# Check if running
if docker-compose -f docker-compose.quick.yml ps | grep -q "Up"; then
    print_success "✅ SADA is now running!"
    echo
    echo "🌐 Access your application:"
    echo "   Local: http://localhost:3000"
    echo "   VPS: http://YOUR_VPS_IP:3000"
    echo
    echo "🔧 Management commands:"
    echo "   View logs: docker-compose -f docker-compose.quick.yml logs -f"
    echo "   Restart: docker-compose -f docker-compose.quick.yml restart"
    echo "   Stop: docker-compose -f docker-compose.quick.yml down"
    echo "   Update: git pull && docker-compose -f docker-compose.quick.yml up -d --build"
    echo
    echo "📊 Monitor resources: docker stats"
    echo "🔍 Check app health: curl http://localhost:3000"
    echo
    echo "📱 Application Features:"
    echo "   • Student Management"
    echo "   • Teacher Management" 
    echo "   • Finance & Expenses"
    echo "   • Data Backup & Restore"
    echo "   • Multi-language Support (Kurdish/English)"
    echo
    print_success "🎉 Deployment completed successfully!"
else
    print_error "❌ Deployment failed. Check logs:"
    docker-compose -f docker-compose.quick.yml logs
    echo
    echo "🔍 Troubleshooting steps:"
    echo "1. Check system resources: free -h && docker stats"
    echo "2. Check Docker service: sudo systemctl status docker"
    echo "3. Check container logs: docker-compose -f docker-compose.quick.yml logs"
    echo "4. Restart Docker: sudo systemctl restart docker"
fi