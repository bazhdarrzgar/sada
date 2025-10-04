#!/bin/bash

##############################################################################
# SADA Management System - Production Deployment Script
# Optimized for Low-Resource VPS (1GB RAM, 1 CPU Core, 30GB SSD)
# 
# This script will:
# 1. Clone the SADA repository
# 2. Configure for production with resource optimizations
# 3. Set up MongoDB with optimizations
# 4. Deploy using Docker with memory limits
# 5. Configure Nginx reverse proxy
# 6. Set up SSL (Let's Encrypt ready)
# 7. Configure system optimizations for low-resource VPS
##############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/bazhdarrzgar/sada.git"
PROJECT_NAME="sada"
DOMAIN="localhost"  # Default domain - no prompting required
EMAIL="admin@localhost"   # Default email - no prompting required
HTTP_PORT="80"
HTTPS_PORT="443"
APP_PORT="3000"
MONGO_PORT="27017"

# System resource limits for optimization
MAX_MEMORY="700m"  # Reserve 300MB for system
MONGO_MEMORY="300m"
APP_MEMORY="400m"
MONGO_CACHE_SIZE="128"  # MB

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root for security reasons."
        print_status "Please run as a regular user with sudo privileges."
        exit 1
    fi
}

# Function to check system requirements
check_system() {
    print_status "Checking system requirements..."
    
    # Check Ubuntu version
    if ! grep -q "Ubuntu" /etc/os-release; then
        print_warning "This script is optimized for Ubuntu. Proceeding anyway..."
    fi
    
    # Check available memory
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$TOTAL_MEM" -lt 900 ]; then
        print_warning "Available RAM ($TOTAL_MEM MB) is very low. Consider upgrading for better performance."
    fi
    
    # Check available disk space
    AVAILABLE_SPACE=$(df / | tail -1 | awk '{print $4}')
    if [ "$AVAILABLE_SPACE" -lt 5000000 ]; then  # 5GB in KB
        print_warning "Available disk space is low. Ensure you have at least 5GB free."
    fi
    
    print_success "System check completed."
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    
    # Update package list and upgrade existing packages
    sudo apt-get update
    sudo apt-get upgrade -y
    
    # Install essential system packages
    print_status "Installing essential system packages..."
    sudo apt-get install -y \
        curl \
        wget \
        git \
        htop \
        iotop \
        nethogs \
        tree \
        vim \
        nano \
        ufw \
        fail2ban \
        unzip \
        zip \
        tar \
        gzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        build-essential \
        openssl \
        cron \
        logrotate \
        rsync \
        screen \
        tmux
    
    # Install networking and monitoring tools
    print_status "Installing networking and monitoring tools..."
    sudo apt-get install -y \
        net-tools \
        dnsutils \
        traceroute \
        tcpdump \
        nmap \
        iftop \
        nload \
        speedtest-cli
    
    # Install Node.js (latest LTS) - needed for some management tools
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js LTS..."
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
        print_success "Node.js $(node --version) installed successfully."
    else
        print_success "Node.js $(node --version) is already installed."
    fi
    
    # Install Yarn package manager
    if ! command -v yarn &> /dev/null; then
        print_status "Installing Yarn package manager..."
        curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | sudo tee /usr/share/keyrings/yarnkey.gpg >/dev/null
        echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
        sudo apt-get update
        sudo apt-get install -y yarn
        print_success "Yarn $(yarn --version) installed successfully."
    else
        print_success "Yarn $(yarn --version) is already installed."
    fi
    
    # Install Docker
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker Engine..."
        
        # Remove any old Docker versions
        sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Install Docker from official repository
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
        # Start and enable Docker service
        sudo systemctl start docker
        sudo systemctl enable docker
        
        # Verify Docker installation
        if sudo docker run hello-world >/dev/null 2>&1; then
            print_success "Docker $(sudo docker --version) installed and verified successfully."
        else
            print_error "Docker installation verification failed."
            exit 1
        fi
    else
        print_success "Docker $(docker --version) is already installed."
        # Ensure Docker service is running
        sudo systemctl start docker
        sudo systemctl enable docker
    fi
    
    # Install Docker Compose (standalone)
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing Docker Compose..."
        
        # Get latest version
        DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
        
        # Download and install Docker Compose
        sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        
        # Create symlink for easier access
        sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
        
        # Verify installation
        if docker-compose --version >/dev/null 2>&1; then
            print_success "Docker Compose $(docker-compose --version) installed successfully."
        else
            print_error "Docker Compose installation failed."
            exit 1
        fi
    else
        print_success "Docker Compose $(docker-compose --version) is already installed."
    fi
    
    # Install Nginx web server
    if ! command -v nginx &> /dev/null; then
        print_status "Installing Nginx web server..."
        sudo apt-get install -y nginx
        
        # Start and enable Nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
        
        print_success "Nginx $(nginx -v 2>&1 | cut -d' ' -f3) installed successfully."
    else
        print_success "Nginx is already installed."
        sudo systemctl start nginx
        sudo systemctl enable nginx
    fi
    
    # Install SSL/TLS tools
    print_status "Installing SSL/TLS tools..."
    sudo apt-get install -y \
        certbot \
        python3-certbot-nginx \
        ssl-cert
    
    # Install database tools
    print_status "Installing database and backup tools..."
    sudo apt-get install -y \
        mongodb-clients \
        jq \
        xmlstarlet
    
    # Install security tools
    print_status "Installing security tools..."
    sudo apt-get install -y \
        fail2ban \
        ufw \
        rkhunter \
        chkrootkit \
        lynis
    
    # Install system monitoring tools
    print_status "Installing system monitoring tools..."
    sudo apt-get install -y \
        htop \
        iotop \
        nethogs \
        iftop \
        nload \
        ncdu \
        dstat \
        sysstat \
        glances
    
    # Install log management tools
    print_status "Installing log management tools..."
    sudo apt-get install -y \
        logrotate \
        rsyslog \
        logwatch
    
    # Install backup and archive tools
    print_status "Installing backup and archive tools..."
    sudo apt-get install -y \
        rsync \
        duplicity \
        borgbackup \
        p7zip-full \
        pigz
    
    # Clean up package cache to save space
    sudo apt-get autoremove -y
    sudo apt-get autoclean
    
    print_success "All dependencies installed successfully!"
    
    # Verify critical installations
    print_status "Verifying critical installations..."
    
    local errors=0
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker installation failed"
        errors=$((errors + 1))
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose installation failed"
        errors=$((errors + 1))
    fi
    
    # Check Nginx
    if ! command -v nginx &> /dev/null; then
        print_error "Nginx installation failed"
        errors=$((errors + 1))
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js installation failed"
        errors=$((errors + 1))
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git installation failed"
        errors=$((errors + 1))
    fi
    
    if [ $errors -eq 0 ]; then
        print_success "All critical dependencies verified successfully!"
    else
        print_error "$errors critical dependencies failed to install properly."
        exit 1
    fi
}

# Function to install additional development tools (optional)
install_development_tools() {
    print_status "Installing additional development and troubleshooting tools..."
    
    # Development tools
    sudo apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        make \
        gcc \
        g++ \
        libc6-dev \
        pkg-config
    
    # Install useful Python packages for system management
    sudo pip3 install \
        docker-compose \
        httpie \
        speedtest-cli \
        glances \
        psutil
    
    # Install MongoDB shell (mongosh) - latest version
    if ! command -v mongosh &> /dev/null; then
        print_status "Installing MongoDB Shell (mongosh)..."
        wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
        echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        sudo apt-get update
        sudo apt-get install -y mongodb-mongosh
        print_success "MongoDB Shell installed successfully."
    fi
    
    # Install Redis CLI (useful for caching if needed later)
    sudo apt-get install -y redis-tools
    
    print_success "Development tools installed successfully!"
}

# Function to configure system services
configure_system_services() {
    print_status "Configuring system services..."
    
    # Configure fail2ban for SSH protection
    sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
    
    # Create custom fail2ban configuration
    cat << 'EOF' | sudo tee /etc/fail2ban/jail.d/custom.conf
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
findtime = 600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 1800

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
EOF
    
    # Start and enable fail2ban
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    # Configure logrotate for application logs
    cat << 'EOF' | sudo tee /etc/logrotate.d/sada
/var/log/sada-*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}

/home/*/sada/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    copytruncate
    su root root
}
EOF
    
    # Configure system limits for better performance
    cat << 'EOF' | sudo tee -a /etc/security/limits.conf
# Increase limits for better performance
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
root soft nofile 65536
root hard nofile 65536
EOF
    
    # Configure sysctl for network performance
    cat << 'EOF' | sudo tee -a /etc/sysctl.conf

# Network performance tuning
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_window_scaling = 1
net.ipv4.tcp_timestamps = 1
net.ipv4.tcp_sack = 1
net.ipv4.tcp_no_metrics_save = 1
net.ipv4.route.flush = 1
net.ipv6.route.flush = 1

# File system performance
fs.file-max = 2097152
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
EOF
    
    print_success "System services configured successfully."
}

# Function to optimize system for low resources
optimize_system() {
    print_status "Optimizing system for low-resource VPS..."
    
    # Configure swap if not exists (for 1GB RAM systems)
    if [ ! -f /swapfile ]; then
        print_status "Creating swap file (1GB)..."
        sudo fallocate -l 1G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        
        # Optimize swap usage
        echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
        echo 'vm.vfs_cache_pressure=50' | sudo tee -a /etc/sysctl.conf
        print_success "Swap file created and optimized."
    fi
    
    # Configure kernel parameters for better memory management
    cat << EOF | sudo tee -a /etc/sysctl.conf
# Memory optimization for low-resource VPS
vm.overcommit_memory=1
vm.overcommit_ratio=50
vm.dirty_background_ratio=5
vm.dirty_ratio=10
vm.dirty_expire_centisecs=12000
vm.dirty_writeback_centisecs=1200
net.core.somaxconn=1024
net.ipv4.tcp_max_syn_backlog=2048
EOF
    
    # Apply kernel parameters
    sudo sysctl -p
    
    # Configure Docker daemon for resource optimization
    sudo mkdir -p /etc/docker
    cat << EOF | sudo tee /etc/docker/daemon.json
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "default-ulimits": {
        "nofile": {
            "Name": "nofile",
            "Hard": 64000,
            "Soft": 64000
        }
    },
    "max-concurrent-downloads": 3,
    "max-concurrent-uploads": 3
}
EOF
    
    print_success "System optimization completed."
}

# Function to configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    # Reset UFW to defaults
    sudo ufw --force reset
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (be careful with this)
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow $HTTP_PORT
    sudo ufw allow $HTTPS_PORT
    
    # Allow MongoDB only from localhost (security)
    sudo ufw allow from 127.0.0.1 to any port $MONGO_PORT
    
    # Enable firewall
    sudo ufw --force enable
    
    print_success "Firewall configured."
}

# Function to clone repository
clone_repository() {
    print_status "Cloning SADA repository..."
    
    # Remove existing directory if it exists
    if [ -d "$PROJECT_NAME" ]; then
        print_warning "Directory $PROJECT_NAME already exists. Backing up..."
        mv $PROJECT_NAME ${PROJECT_NAME}_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    # Clone repository
    git clone $REPO_URL $PROJECT_NAME
    cd $PROJECT_NAME
    
    print_success "Repository cloned successfully."
}

# Function to create optimized production docker-compose file
create_production_compose() {
    print_status "Creating optimized production docker-compose configuration..."
    
    # Generate secure MongoDB password
    MONGO_PASSWORD=$(openssl rand -base64 32)
    
    # Create environment file
    cat << EOF > .env
# Production Environment Variables
NODE_ENV=production
MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/sada?authSource=admin
MONGO_URL=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/sada?authSource=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
NEXT_TELEMETRY_DISABLED=1
DOCKER_ENV=true

# Domain configuration
DOMAIN=${DOMAIN}
EMAIL=${EMAIL}
EOF
    
    # Create optimized docker-compose for production
    cat << EOF > docker-compose.production.yml
version: '3.8'

services:
  # MongoDB Database Service - Optimized for 1GB RAM
  mongodb:
    image: mongo:7.0
    container_name: sada_mongodb_prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: sada
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: \${MONGO_ROOT_PASSWORD}
    ports:
      - "127.0.0.1:27017:27017"  # Bind only to localhost for security
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - sada_network
    deploy:
      resources:
        limits:
          memory: ${MONGO_MEMORY}
        reservations:
          memory: 200m
    command: >
      mongod 
      --auth 
      --wiredTigerCacheSizeGB=0.${MONGO_CACHE_SIZE}
      --wiredTigerCollectionBlockCompressor=zlib
      --slowOpThresholdMs=2000
      --maxConns=100
    healthcheck:
      test: ["CMD-SHELL", "mongosh --eval 'db.adminCommand(\"ping\")' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Next.js Application Service - Memory Optimized
  app:
    build: 
      context: .
      dockerfile: Dockerfile
    container_name: sada_app_prod
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - MONGODB_URI=\${MONGODB_URI}
      - MONGO_URL=\${MONGO_URL}
      - NEXT_TELEMETRY_DISABLED=1
      - DOCKER_ENV=true
      - NODE_OPTIONS=--max-old-space-size=350
    ports:
      - "127.0.0.1:3000:3000"  # Bind only to localhost, Nginx will proxy
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - sada_network
    volumes:
      - upload_data:/app/public/upload
      - ./logs:/app/logs
    deploy:
      resources:
        limits:
          memory: ${APP_MEMORY}
        reservations:
          memory: 250m
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:3000 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

# Volumes for persistent data
volumes:
  mongodb_data:
    driver: local
  mongodb_config:
    driver: local
  upload_data:
    driver: local

# Networks
networks:
  sada_network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF
    
    # Create MongoDB initialization script
    cat << EOF > mongo-init.js
// Initialize MongoDB for production
db = db.getSiblingDB('sada');

// Create indexes for better performance
db.user_profiles.createIndex({ "username": 1 }, { unique: true });
db.user_profiles.createIndex({ "email": 1 }, { unique: true });

// Set up initial admin user if not exists
if (db.user_profiles.countDocuments() === 0) {
    db.user_profiles.insertOne({
        username: "admin",
        displayName: "System Administrator",
        email: "admin@sada.local",
        role: "admin",
        createdAt: new Date(),
        active: true
    });
    print("✅ Initial admin user created");
} else {
    print("ℹ️  Users collection already initialized");
}
EOF
    
    print_success "Production configuration created."
}

# Function to create optimized Nginx configuration
create_nginx_config() {
    print_status "Creating optimized Nginx configuration..."
    
    # Create Nginx configuration for SADA
    sudo tee /etc/nginx/sites-available/sada > /dev/null << EOF
# Nginx configuration optimized for low-resource VPS
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
    
    # Main proxy configuration
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings for low memory
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://127.0.0.1:3000;
    }
    
    # Upload files
    location /upload/ {
        expires 30d;
        add_header Cache-Control "public";
        proxy_pass http://127.0.0.1:3000;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/sada /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    
    # Reload Nginx
    sudo systemctl reload nginx
    
    print_success "Nginx configuration created and enabled."
}

# Function to get domain and email for SSL
get_domain_info() {
    if [ -z "$DOMAIN" ]; then
        DOMAIN="localhost"
        print_status "No domain specified, using default: localhost"
    fi
    
    if [ -z "$EMAIL" ]; then
        EMAIL="admin@localhost"
        print_status "No email specified, using default: admin@localhost"
    fi
    
    print_status "Domain: $DOMAIN"
    print_status "Email: $EMAIL"
}

# Function to setup SSL with Let's Encrypt
setup_ssl() {
    print_status "Setting up SSL certificate with Let's Encrypt..."
    
    # Get SSL certificate
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL certificate installed and auto-renewal configured."
}

# Function to create monitoring script
create_monitoring() {
    print_status "Creating system monitoring script..."
    
    cat << 'EOF' > monitor-sada.sh
#!/bin/bash
# SADA System Monitoring Script

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== SADA System Status ==="
echo "Date: $(date)"
echo

# Check disk usage
echo "📊 Disk Usage:"
df -h / | grep -E "Filesystem|/" | awk '{print $1 "\t" $3 "/" $2 " (" $5 ")"}'
echo

# Check memory usage
echo "💾 Memory Usage:"
free -h | grep -E "Mem:|Swap:"
echo

# Check Docker containers
echo "🐳 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo

# Check application health
echo "🏥 Application Health:"
if curl -f http://localhost:3000/health &>/dev/null; then
    echo -e "${GREEN}✅ Application is healthy${NC}"
else
    echo -e "${RED}❌ Application is not responding${NC}"
fi

# Check MongoDB
echo
echo "🍃 MongoDB Status:"
if docker exec sada_mongodb_prod mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo -e "${GREEN}✅ MongoDB is healthy${NC}"
else
    echo -e "${RED}❌ MongoDB is not responding${NC}"
fi

# Check SSL certificate expiry
echo
echo "🔒 SSL Certificate:"
if command -v openssl &> /dev/null && [ ! -z "$1" ]; then
    expiry_date=$(echo | openssl s_client -servername $1 -connect $1:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    echo "Certificate expires: $expiry_date"
fi

echo
echo "=== End of Status Report ==="
EOF
    
    chmod +x monitor-sada.sh
    
    # Create daily monitoring cron job
    (crontab -l 2>/dev/null; echo "0 9 * * * $(pwd)/monitor-sada.sh $DOMAIN >> /var/log/sada-monitor.log 2>&1") | crontab -
    
    print_success "Monitoring script created and scheduled."
}

# Function to create backup script
create_backup_script() {
    print_status "Creating automated backup script..."
    
    cat << 'EOF' > backup-sada.sh
#!/bin/bash
# SADA Automated Backup Script

BACKUP_DIR="/home/$(whoami)/sada-backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "🗄️  Creating MongoDB backup..."
docker exec sada_mongodb_prod mongodump --authenticationDatabase admin -u admin -p "$MONGO_ROOT_PASSWORD" --out /tmp/backup
docker cp sada_mongodb_prod:/tmp/backup $BACKUP_DIR/mongodb_$DATE
docker exec sada_mongodb_prod rm -rf /tmp/backup

# Backup upload files
echo "📁 Backing up upload files..."
docker cp sada_app_prod:/app/public/upload $BACKUP_DIR/uploads_$DATE

# Create compressed archive
echo "📦 Creating compressed archive..."
cd $BACKUP_DIR
tar -czf sada_backup_$DATE.tar.gz mongodb_$DATE uploads_$DATE
rm -rf mongodb_$DATE uploads_$DATE

# Clean old backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "sada_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: sada_backup_$DATE.tar.gz"
EOF
    
    chmod +x backup-sada.sh
    
    # Schedule daily backups at 2 AM
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup-sada.sh >> /var/log/sada-backup.log 2>&1") | crontab -
    
    print_success "Backup script created and scheduled."
}

# Function to deploy application
deploy_application() {
    print_status "Deploying SADA application..."
    
    # Stop any existing containers
    docker-compose -f docker-compose.production.yml down 2>/dev/null || true
    
    # Build and start services
    docker-compose -f docker-compose.production.yml up -d --build
    
    # Wait for services to be healthy
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        print_success "Application deployed successfully!"
    else
        print_error "Some services failed to start. Check logs with: docker-compose -f docker-compose.production.yml logs"
        exit 1
    fi
}

# Function to show final status
show_status() {
    print_success "🎉 SADA Management System has been successfully deployed!"
    echo
    echo "📋 Deployment Summary:"
    echo "  • Domain: $DOMAIN"
    echo "  • HTTP URL: http://$DOMAIN"
    echo "  • HTTPS URL: https://$DOMAIN (if SSL was configured)"
    echo "  • Application Port: $APP_PORT (local only)"
    echo "  • MongoDB Port: $MONGO_PORT (local only)"
    echo
    echo "🔧 Useful Commands:"
    echo "  • Check status: ./monitor-sada.sh"
    echo "  • View logs: docker-compose -f docker-compose.production.yml logs"
    echo "  • Restart services: docker-compose -f docker-compose.production.yml restart"
    echo "  • Update application: git pull && docker-compose -f docker-compose.production.yml up -d --build"
    echo "  • Create backup: ./backup-sada.sh"
    echo
    echo "📁 Important Files:"
    echo "  • Application: $(pwd)"
    echo "  • Logs: /var/log/sada-*.log"
    echo "  • Backups: ~/sada-backups/"
    echo "  • Nginx config: /etc/nginx/sites-available/sada"
    echo
    echo "🔐 Security Notes:"
    echo "  • MongoDB is only accessible from localhost"
    echo "  • Application is behind Nginx reverse proxy"
    echo "  • Firewall is configured with minimal open ports"
    echo "  • Regular backups are scheduled"
    echo
    echo "⚡ Performance Monitoring:"
    echo "  • System optimized for 1GB RAM"
    echo "  • MongoDB cache limited to ${MONGO_CACHE_SIZE}MB"
    echo "  • Node.js heap limited to 350MB"
    echo "  • Gzip compression enabled"
    echo
    print_success "Deployment completed! 🚀"
}

# Main execution
main() {
    echo "🏗️  SADA Management System - Production Deployment"
    echo "=================================================="
    echo
    
    # Run deployment steps
    check_root
    check_system
    get_domain_info
    install_dependencies
    install_development_tools
    configure_system_services
    optimize_system
    configure_firewall
    clone_repository
    create_production_compose
    create_nginx_config
    deploy_application
    
    # Optional SSL setup
    echo
    read -p "🔒 Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        setup_ssl
    fi
    
    # Create monitoring and backup scripts
    create_monitoring
    create_backup_script
    
    # Apply all system optimizations
    print_status "Applying system optimizations..."
    sudo sysctl -p
    
    # Restart Docker daemon to apply optimizations
    print_status "Restarting Docker with optimizations..."
    sudo systemctl restart docker
    sleep 10
    
    # Restart services with new Docker settings
    docker-compose -f docker-compose.production.yml restart
    
    # Final system check
    print_status "Performing final system health check..."
    
    # Check if Docker is running
    if ! sudo systemctl is-active --quiet docker; then
        print_error "Docker service is not running"
        exit 1
    fi
    
    # Check if containers are running
    sleep 15
    if ! docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
        print_warning "Some containers may not be running properly. Check logs:"
        docker-compose -f docker-compose.production.yml logs
    fi
    
    # Check if application is responding
    if curl -f http://localhost:3000/health >/dev/null 2>&1 || curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Application is responding correctly!"
    else
        print_warning "Application may not be responding yet. This is normal and may take a few more minutes."
    fi
    
    # Show final status
    show_status
}

# Run main function
main "$@"