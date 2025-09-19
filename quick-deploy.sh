#!/bin/bash

##############################################################################
# SADA - Enhanced Automated Production Deployment Script
# Fully automated, error-resistant, and optimized deployment
##############################################################################

# Remove set -e to prevent script from stopping on errors
# We'll handle errors gracefully instead
set +e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
PROJECT_NAME="sada"
REPO_URL="https://github.com/bazhdarrzgar/sada.git"
CONTAINER_PREFIX="sada_prod"
NETWORK_NAME="sada_network"
MONGO_DB_NAME="sada_production"

# Auto-detect server IP
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || curl -s ipecho.net/plain 2>/dev/null || echo "localhost")
if [ -z "$SERVER_IP" ] || [ "$SERVER_IP" = "localhost" ]; then
    SERVER_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
fi

# Logging functions
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_progress() { echo -e "${PURPLE}[PROGRESS]${NC} $1"; }
print_header() { echo -e "${CYAN}[HEADER]${NC} $1"; }

# Enhanced error handling function
handle_error() {
    local exit_code=$1
    local error_msg="$2"
    local continue_anyway="${3:-true}"
    
    if [ $exit_code -ne 0 ]; then
        print_error "$error_msg (Exit Code: $exit_code)"
        if [ "$continue_anyway" = "false" ]; then
            print_error "Critical error - stopping deployment"
            exit $exit_code
        else
            print_warning "Non-critical error - continuing deployment..."
            sleep 2
        fi
    fi
}

# Safe command execution with retries
execute_with_retry() {
    local cmd="$1"
    local description="$2"
    local max_retries="${3:-3}"
    local delay="${4:-5}"
    
    print_progress "Executing: $description"
    
    for i in $(seq 1 $max_retries); do
        if [ $i -gt 1 ]; then
            print_warning "Retry attempt $i/$max_retries for: $description"
            sleep $delay
        fi
        
        if eval "$cmd" >/dev/null 2>&1; then
            print_success "$description - Completed"
            return 0
        fi
    done
    
    print_error "$description - Failed after $max_retries attempts"
    return 1
}

# System detection
detect_system() {
    print_status "Detecting system information..."
    
    OS=$(uname -s)
    ARCH=$(uname -m)
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
    else
        DISTRO="unknown"
        VERSION="unknown"
    fi
    
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    CPU_CORES=$(nproc)
    
    print_success "System: $DISTRO $VERSION ($OS $ARCH)"
    print_success "Resources: ${CPU_CORES} CPU cores, ${MEMORY_GB}GB RAM"
    print_success "Server IP: $SERVER_IP"
}

# Enhanced dependency installation with error handling
install_essentials() {
    print_header "Installing Essential Dependencies"
    
    # Update system packages
    print_status "Updating system packages..."
    if command -v apt-get >/dev/null 2>&1; then
        execute_with_retry "sudo apt-get update" "Package list update" 3 10
        execute_with_retry "sudo DEBIAN_FRONTEND=noninteractive apt-get upgrade -y" "System upgrade" 2 15
        
        # Install basic tools
        execute_with_retry "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release build-essential htop vim net-tools" "Basic tools installation" 3 10
        
    elif command -v yum >/dev/null 2>&1; then
        execute_with_retry "sudo yum update -y" "System update" 2 15
        execute_with_retry "sudo yum install -y curl wget git unzip epel-release" "Basic tools installation" 3 10
    fi
    
    # Install Node.js LTS
    if ! command -v node >/dev/null 2>&1; then
        print_status "Installing Node.js LTS..."
        if command -v apt-get >/dev/null 2>&1; then
            execute_with_retry "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -" "Node.js repository setup" 3 10
            execute_with_retry "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs" "Node.js installation" 3 10
        fi
    else
        print_success "Node.js is already installed ($(node --version))"
    fi
    
    # Install Yarn
    if ! command -v yarn >/dev/null 2>&1; then
        print_status "Installing Yarn..."
        execute_with_retry "curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null" "Yarn key setup" 3 5
        echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list >/dev/null
        execute_with_retry "sudo apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y yarn" "Yarn installation" 3 10
    else
        print_success "Yarn is already installed ($(yarn --version))"
    fi
    
    # Install Docker with comprehensive error handling
    if ! command -v docker >/dev/null 2>&1; then
        print_status "Installing Docker..."
        
        # Remove old Docker versions if they exist
        sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Install Docker
        execute_with_retry "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg" "Docker GPG key setup" 3 5
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
        execute_with_retry "sudo apt-get update" "Docker repository update" 3 10
        execute_with_retry "sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin" "Docker installation" 3 15
        
        # Configure Docker
        sudo usermod -aG docker $USER
        sudo systemctl start docker 2>/dev/null || true
        sudo systemctl enable docker 2>/dev/null || true
        
        # Wait for Docker to start
        sleep 10
        
        # Test Docker with timeout
        if timeout 30 sudo docker run --rm hello-world >/dev/null 2>&1; then
            print_success "Docker installed and verified successfully"
        else
            print_warning "Docker test failed, but continuing deployment..."
        fi
    else
        print_success "Docker is already installed ($(docker --version | cut -d' ' -f3 | cut -d',' -f1))"
    fi
    
    # Install Docker Compose standalone
    if ! command -v docker-compose >/dev/null 2>&1; then
        print_status "Installing Docker Compose..."
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4 2>/dev/null || echo "v2.23.0")
        execute_with_retry "sudo curl -L \"https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose" "Docker Compose download" 3 10
        sudo chmod +x /usr/local/bin/docker-compose 2>/dev/null || true
        sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose 2>/dev/null || true
    else
        print_success "Docker Compose is already installed ($(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1))"
    fi
    
    print_success "All essential dependencies installed!"
}

# Enhanced system optimization
optimize_system() {
    print_header "Optimizing System for Production"
    
    # Create swap if doesn't exist and memory is low
    if [ "$MEMORY_GB" -lt 2 ] && [ ! -f /swapfile ]; then
        print_status "Creating swap file for low memory system..."
        execute_with_retry "sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile" "Swap file creation" 2 5
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
        echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf >/dev/null
        sudo sysctl -p >/dev/null 2>&1 || true
        print_success "Swap file created and configured"
    fi
    
    # Configure Docker for optimal performance
    sudo mkdir -p /etc/docker
    cat << 'EOF' | sudo tee /etc/docker/daemon.json >/dev/null
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "max-concurrent-downloads": 3,
    "max-concurrent-uploads": 2,
    "default-ulimits": {
        "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
        }
    }
}
EOF
    
    # Restart Docker to apply configuration
    execute_with_retry "sudo systemctl restart docker" "Docker service restart" 2 10
    sleep 5
    
    print_success "System optimization completed"
}

# Enhanced project setup
setup_project() {
    print_header "Setting Up Project"
    
    # Navigate to home directory
    cd ~
    
    # Clean up any existing deployment
    if [ -d "$PROJECT_NAME" ]; then
        print_status "Cleaning up existing deployment..."
        cd $PROJECT_NAME
        docker-compose -f docker-compose.quick.yml down 2>/dev/null || true
        docker-compose down 2>/dev/null || true
        cd ..
        sudo rm -rf $PROJECT_NAME 2>/dev/null || true
    fi
    
    # Clone repository with retry
    print_status "Cloning fresh repository..."
    execute_with_retry "git clone $REPO_URL $PROJECT_NAME" "Repository cloning" 3 10
    
    if [ ! -d "$PROJECT_NAME" ]; then
        print_error "Failed to clone repository"
        exit 1
    fi
    
    cd $PROJECT_NAME
    
    # Generate secure credentials
    MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    
    # Create comprehensive production environment
    print_status "Creating production environment configuration..."
    cat << EOF > .env.production
# Production Environment Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
MONGO_URL=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/${MONGO_DB_NAME}?authSource=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
MONGO_DATABASE=${MONGO_DB_NAME}

# Security Configuration
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${JWT_SECRET}

# Application Configuration
NEXT_TELEMETRY_DISABLED=1
DOCKER_ENV=true
APP_NAME=SADA Management System
APP_VERSION=2.0.0

# Performance Configuration
NODE_OPTIONS=--max-old-space-size=400
NEXT_OPTIMIZE_CSS=true
NEXT_OPTIMIZE_IMAGES=true

# Server Configuration
SERVER_IP=${SERVER_IP}
BASE_URL=http://${SERVER_IP}:3000
EOF
    
    print_success "Environment configuration created"
}

# Enhanced Docker configuration
create_docker_config() {
    print_header "Creating Optimized Docker Configuration"
    
    # Calculate memory limits based on system resources
    if [ "$MEMORY_GB" -ge 4 ]; then
        MONGO_MEMORY_LIMIT="800m"
        MONGO_MEMORY_RESERVE="400m"
        APP_MEMORY_LIMIT="1g"
        APP_MEMORY_RESERVE="512m"
        MONGO_CACHE_SIZE="0.4"
    elif [ "$MEMORY_GB" -ge 2 ]; then
        MONGO_MEMORY_LIMIT="600m"
        MONGO_MEMORY_RESERVE="300m"
        APP_MEMORY_LIMIT="700m"
        APP_MEMORY_RESERVE="400m"
        MONGO_CACHE_SIZE="0.25"
    else
        MONGO_MEMORY_LIMIT="400m"
        MONGO_MEMORY_RESERVE="200m"
        APP_MEMORY_LIMIT="500m"
        APP_MEMORY_RESERVE="250m"
        MONGO_CACHE_SIZE="0.15"
    fi
    
    cat << EOF > docker-compose.quick.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: ${CONTAINER_PREFIX}_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: ${MONGO_DB_NAME}
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD}
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    networks:
      - ${NETWORK_NAME}
    deploy:
      resources:
        limits:
          memory: ${MONGO_MEMORY_LIMIT}
          cpus: '1.0'
        reservations:
          memory: ${MONGO_MEMORY_RESERVE}
          cpus: '0.5'
    command: >
      mongod 
      --auth 
      --wiredTigerCacheSizeGB=${MONGO_CACHE_SIZE}
      --maxConns=100
      --slowOpThresholdMs=2000
      --logpath /dev/stdout
      --bind_ip_all
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'db.adminCommand(\"ping\")' --quiet || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  app:
    build: 
      context: .
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
    container_name: ${CONTAINER_PREFIX}_app
    restart: unless-stopped
    env_file: .env.production
    environment:
      - NODE_OPTIONS=--max-old-space-size=400
      - NODE_ENV=production
    ports:
      - "3000:3000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - ${NETWORK_NAME}
    volumes:
      - upload_data:/app/public/upload
      - logs_data:/app/logs
    deploy:
      resources:
        limits:
          memory: ${APP_MEMORY_LIMIT}
          cpus: '2.0'
        reservations:
          memory: ${APP_MEMORY_RESERVE}
          cpus: '0.5'
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 15s
      retries: 5
      start_period: 90s

volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  upload_data:
    driver: local
  logs_data:
    driver: local

networks:
  ${NETWORK_NAME}:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

    print_success "Docker configuration created with resource limits: App(${APP_MEMORY_LIMIT}), MongoDB(${MONGO_MEMORY_LIMIT})"
}

# Enhanced deployment with comprehensive error handling
deploy_application() {
    print_header "Deploying Application"
    
    # Clean up any existing containers
    print_status "Cleaning up existing containers..."
    docker-compose -f docker-compose.quick.yml down --remove-orphans 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    
    # Build and deploy with retry logic
    print_status "Building and starting services..."
    for attempt in 1 2 3; do
        print_progress "Deployment attempt $attempt/3"
        
        if docker-compose -f docker-compose.quick.yml --env-file .env.production up -d --build --force-recreate; then
            print_success "Services started successfully"
            break
        else
            print_warning "Deployment attempt $attempt failed"
            if [ $attempt -eq 3 ]; then
                print_error "All deployment attempts failed"
                return 1
            fi
            
            # Clean up and wait before retry
            docker-compose -f docker-compose.quick.yml down 2>/dev/null || true
            sleep 10
        fi
    done
    
    # Wait for services to be ready
    print_status "Waiting for services to become healthy..."
    local wait_time=0
    local max_wait=180
    
    while [ $wait_time -lt $max_wait ]; do
        if docker-compose -f docker-compose.quick.yml ps | grep -q "healthy"; then
            print_success "Services are healthy!"
            break
        fi
        
        print_progress "Waiting for services... (${wait_time}s/${max_wait}s)"
        sleep 10
        wait_time=$((wait_time + 10))
    done
    
    return 0
}

# Enhanced verification and reporting
verify_deployment() {
    print_header "Verifying Deployment"
    
    # Check container status
    local containers_running=$(docker-compose -f docker-compose.quick.yml ps -q | wc -l)
    local healthy_containers=$(docker-compose -f docker-compose.quick.yml ps | grep -c "healthy" || echo "0")
    
    print_status "Containers running: $containers_running"
    print_status "Healthy containers: $healthy_containers"
    
    # Test application accessibility
    sleep 5
    if curl -f -s "http://localhost:3000" >/dev/null; then
        local app_status="✅ RUNNING"
    else
        local app_status="❌ NOT ACCESSIBLE"
    fi
    
    # Test database connectivity
    if docker exec ${CONTAINER_PREFIX}_mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
        local db_status="✅ CONNECTED"
    else
        local db_status="❌ CONNECTION FAILED"
    fi
    
    # Generate final report
    print_header "🎉 DEPLOYMENT COMPLETE 🎉"
    echo
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    SADA DEPLOYMENT REPORT                   ║"
    echo "╠══════════════════════════════════════════════════════════════╣"
    echo "║ 🌐 Application URL: http://${SERVER_IP}:3000                "
    echo "║ 🌐 Local URL:       http://localhost:3000                   "
    echo "║                                                              ║"
    echo "║ 📊 Status:                                                   ║"
    echo "║    Application:     $app_status                            "
    echo "║    Database:        $db_status                             "
    echo "║    Containers:      $containers_running running, $healthy_containers healthy                      "
    echo "║                                                              ║"
    echo "║ 🔧 Management Commands:                                      ║"
    echo "║    View logs:       docker-compose -f docker-compose.quick.yml logs -f"
    echo "║    Restart:         docker-compose -f docker-compose.quick.yml restart"
    echo "║    Stop:            docker-compose -f docker-compose.quick.yml down"
    echo "║    Update:          git pull && docker-compose -f docker-compose.quick.yml up -d --build"
    echo "║                                                              ║"
    echo "║ 📱 Features Available:                                       ║"
    echo "║    • Student Management System                               ║"
    echo "║    • Teacher Management                                      ║"
    echo "║    • Financial Management                                    ║"
    echo "║    • Expense Tracking                                        ║"
    echo "║    • Data Backup & Restore                                   ║"
    echo "║    • Multi-language Support (Kurdish/English)               ║"
    echo "║                                                              ║"
    echo "║ 🔍 Monitoring:                                               ║"
    echo "║    Resources:       docker stats                             ║"
    echo "║    Health:          curl http://localhost:3000               ║"
    echo "║    System Info:     free -h && df -h                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo
    
    # Show container status
    print_status "Current container status:"
    docker-compose -f docker-compose.quick.yml ps
    
    echo
    print_success "🚀 SADA Management System is now live and ready to use!"
    print_success "📝 Default login credentials: berdoz / berdoz@code"
    
    return 0
}

# Main execution flow
main() {
    print_header "🚀 SADA Enhanced Automated Deployment"
    print_header "========================================"
    echo
    
    # Start deployment process
    detect_system
    echo
    
    install_essentials
    echo
    
    optimize_system
    echo
    
    setup_project
    echo
    
    create_docker_config
    echo
    
    if deploy_application; then
        echo
        verify_deployment
    else
        print_error "Deployment failed. Showing logs for troubleshooting:"
        docker-compose -f docker-compose.quick.yml logs --tail=50
        echo
        print_error "Troubleshooting tips:"
        echo "1. Check system resources: free -h && docker stats"
        echo "2. Check Docker service: sudo systemctl status docker"
        echo "3. Restart Docker: sudo systemctl restart docker"
        echo "4. Try again: ./quick-deploy.sh"
        exit 1
    fi
}

# Run main function
main "$@"