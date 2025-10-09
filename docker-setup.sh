#!/bin/bash

# ============================================================================
# Sada Docker Complete Setup Script
# ============================================================================
# This script will:
# 1. Check all prerequisites
# 2. Install missing dependencies
# 3. Setup environment
# 4. Build Docker images
# 5. Start containers
# 6. Verify deployment
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/docker-setup.log"
ENV_FILE="${SCRIPT_DIR}/.env"
ENV_EXAMPLE="${SCRIPT_DIR}/.env.example"

# Global variables
INSTALL_DOCKER=false
INSTALL_COMPOSE=false
DEPLOYMENT_MODE=""
PORT_PRODUCTION=3000
PORT_DEVELOPMENT=3001

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

print_header() {
    clear
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║        🏫 Sada School Management System                       ║"
    echo "║        Complete Docker Setup & Deployment                     ║"
    echo "║                                                                ║"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo -e "${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] STEP: $1" >> "$LOG_FILE"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $1" >> "$LOG_FILE"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] INFO: $1" >> "$LOG_FILE"
}

separator() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
}

# ============================================================================
# PREREQUISITE CHECKS
# ============================================================================

check_os() {
    print_step "Checking operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_success "Linux detected"
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        print_success "macOS detected"
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        print_success "Windows detected"
        OS="windows"
    else
        print_warning "Unknown OS: $OSTYPE"
        OS="unknown"
    fi
}

check_docker() {
    print_step "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
        print_success "Docker is installed (version: $DOCKER_VERSION)"
        return 0
    else
        print_warning "Docker is not installed"
        INSTALL_DOCKER=true
        return 1
    fi
}

check_docker_compose() {
    print_step "Checking Docker Compose installation..."
    
    if command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version | awk '{print $3}' | sed 's/,//')
        print_success "Docker Compose is installed (version: $COMPOSE_VERSION)"
        return 0
    elif docker compose version &> /dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version --short)
        print_success "Docker Compose (plugin) is installed (version: $COMPOSE_VERSION)"
        return 0
    else
        print_warning "Docker Compose is not installed"
        INSTALL_COMPOSE=true
        return 1
    fi
}

check_docker_running() {
    print_step "Checking if Docker daemon is running..."
    
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
        return 0
    else
        print_error "Docker daemon is not running"
        echo ""
        print_info "Please start Docker and run this script again"
        if [[ "$OS" == "linux" ]]; then
            echo "  sudo systemctl start docker"
        elif [[ "$OS" == "macos" ]]; then
            echo "  Open Docker Desktop application"
        fi
        return 1
    fi
}

check_ports() {
    print_step "Checking if required ports are available..."
    
    local ports_ok=true
    
    # Check production port
    if lsof -Pi :$PORT_PRODUCTION -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_error "Port $PORT_PRODUCTION is already in use"
        echo "  Process using port: $(lsof -Pi :$PORT_PRODUCTION -sTCP:LISTEN -t | xargs ps -p | tail -1)"
        ports_ok=false
    else
        print_success "Port $PORT_PRODUCTION is available"
    fi
    
    # Check development port
    if lsof -Pi :$PORT_DEVELOPMENT -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_warning "Port $PORT_DEVELOPMENT is in use (only needed for development mode)"
    else
        print_success "Port $PORT_DEVELOPMENT is available"
    fi
    
    if [ "$ports_ok" = false ]; then
        echo ""
        read -p "Do you want to continue anyway? (y/n): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return 1
        fi
    fi
    
    return 0
}

check_disk_space() {
    print_step "Checking available disk space..."
    
    local available_space=$(df -BG "$SCRIPT_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')
    
    if [ "$available_space" -lt 2 ]; then
        print_error "Insufficient disk space (need at least 2GB, have ${available_space}GB)"
        return 1
    else
        print_success "Sufficient disk space available (${available_space}GB)"
        return 0
    fi
}

# ============================================================================
# INSTALLATION FUNCTIONS
# ============================================================================

install_docker_linux() {
    print_step "Installing Docker on Linux..."
    
    # Detect distribution
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
    else
        print_error "Cannot detect Linux distribution"
        return 1
    fi
    
    case $DISTRO in
        ubuntu|debian)
            print_info "Installing Docker on Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y ca-certificates curl gnupg lsb-release
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$DISTRO $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
            sudo apt-get update
            sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            ;;
        centos|rhel|fedora)
            print_info "Installing Docker on CentOS/RHEL/Fedora..."
            sudo yum install -y yum-utils
            sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
            sudo systemctl start docker
            sudo systemctl enable docker
            ;;
        *)
            print_error "Unsupported Linux distribution: $DISTRO"
            return 1
            ;;
    esac
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for group changes to take effect"
    
    return 0
}

install_docker_macos() {
    print_step "Docker installation on macOS..."
    
    if command -v brew &> /dev/null; then
        print_info "Installing Docker Desktop via Homebrew..."
        brew install --cask docker
        print_success "Docker Desktop installed"
        print_info "Please open Docker Desktop application and run this script again"
    else
        print_error "Homebrew not found"
        print_info "Please install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
    fi
    
    return 1
}

install_docker_compose() {
    print_step "Installing Docker Compose..."
    
    if [[ "$OS" == "linux" ]]; then
        # Install Docker Compose standalone
        local COMPOSE_VERSION="v2.23.3"
        sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        print_success "Docker Compose installed"
    else
        print_info "Docker Compose should be included with Docker Desktop"
    fi
    
    return 0
}

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

setup_environment() {
    print_step "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f "$ENV_FILE" ]; then
        if [ -f "$ENV_EXAMPLE" ]; then
            print_info "Creating .env file from .env.example..."
            cp "$ENV_EXAMPLE" "$ENV_FILE"
            print_success ".env file created"
        else
            print_info "Creating basic .env file..."
            cat > "$ENV_FILE" << EOF
# Sada Environment Configuration
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
EOF
            print_success ".env file created"
        fi
    else
        print_info ".env file already exists"
    fi
    
    # Create necessary directories
    print_info "Creating necessary directories..."
    mkdir -p "${SCRIPT_DIR}/database"
    mkdir -p "${SCRIPT_DIR}/public/upload"
    mkdir -p "${SCRIPT_DIR}/backups"
    print_success "Directories created"
    
    # Make helper scripts executable
    print_info "Making helper scripts executable..."
    chmod +x "${SCRIPT_DIR}/docker-start.sh" 2>/dev/null || true
    chmod +x "${SCRIPT_DIR}/docker-health-check.sh" 2>/dev/null || true
    chmod +x "${SCRIPT_DIR}/docker-verify.sh" 2>/dev/null || true
    print_success "Scripts are executable"
}

# ============================================================================
# DEPLOYMENT MODE SELECTION
# ============================================================================

select_deployment_mode() {
    separator
    echo -e "${YELLOW}Select Deployment Mode:${NC}"
    echo ""
    echo "  1) Production (recommended for deployment)"
    echo "     - Optimized build"
    echo "     - Port: 3000"
    echo "     - No hot reload"
    echo ""
    echo "  2) Development (for development)"
    echo "     - Hot reload enabled"
    echo "     - Port: 3001"
    echo "     - Source code mounted"
    echo ""
    echo "  3) Both (production + development)"
    echo ""
    
    while true; do
        read -p "Enter choice [1-3]: " choice
        case $choice in
            1)
                DEPLOYMENT_MODE="production"
                print_success "Production mode selected"
                break
                ;;
            2)
                DEPLOYMENT_MODE="development"
                print_success "Development mode selected"
                break
                ;;
            3)
                DEPLOYMENT_MODE="both"
                print_success "Both modes selected"
                break
                ;;
            *)
                print_error "Invalid choice. Please enter 1, 2, or 3"
                ;;
        esac
    done
    separator
}

# ============================================================================
# DOCKER BUILD & START
# ============================================================================

build_images() {
    print_step "Building Docker images..."
    echo ""
    print_info "This may take several minutes on first build..."
    echo ""
    
    case $DEPLOYMENT_MODE in
        production)
            docker-compose build --no-cache app
            ;;
        development)
            docker-compose build --no-cache app-dev
            ;;
        both)
            docker-compose build --no-cache app app-dev
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "Docker images built successfully"
        return 0
    else
        print_error "Failed to build Docker images"
        return 1
    fi
}

start_containers() {
    print_step "Starting Docker containers..."
    echo ""
    
    case $DEPLOYMENT_MODE in
        production)
            docker-compose up -d app
            ;;
        development)
            docker-compose --profile dev up -d app-dev
            ;;
        both)
            docker-compose up -d app
            docker-compose --profile dev up -d app-dev
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        print_success "Containers started successfully"
        return 0
    else
        print_error "Failed to start containers"
        return 1
    fi
}

wait_for_healthy() {
    local container=$1
    local max_wait=$2
    local waited=0
    
    print_step "Waiting for $container to be healthy..."
    
    while [ $waited -lt $max_wait ]; do
        if docker ps --format '{{.Names}}' | grep -q "$container"; then
            local health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null || echo "no-health-check")
            
            if [ "$health" = "healthy" ] || [ "$health" = "no-health-check" ]; then
                print_success "$container is ready"
                return 0
            fi
            
            echo -n "."
            sleep 2
            waited=$((waited + 2))
        else
            print_error "$container is not running"
            return 1
        fi
    done
    
    echo ""
    print_warning "$container is taking longer than expected"
    return 1
}

# ============================================================================
# VERIFICATION
# ============================================================================

verify_deployment() {
    separator
    print_step "Verifying deployment..."
    echo ""
    
    local all_ok=true
    
    case $DEPLOYMENT_MODE in
        production)
            if docker ps | grep -q sada_app; then
                print_success "Production container is running"
                wait_for_healthy "sada_app" 60 || all_ok=false
                
                # Test HTTP endpoint
                sleep 5
                if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT_PRODUCTION | grep -q "200"; then
                    print_success "Application is responding on port $PORT_PRODUCTION"
                else
                    print_error "Application is not responding on port $PORT_PRODUCTION"
                    all_ok=false
                fi
            else
                print_error "Production container is not running"
                all_ok=false
            fi
            ;;
            
        development)
            if docker ps | grep -q sada_app_dev; then
                print_success "Development container is running"
                wait_for_healthy "sada_app_dev" 60 || all_ok=false
                
                sleep 5
                if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT_DEVELOPMENT | grep -q "200"; then
                    print_success "Application is responding on port $PORT_DEVELOPMENT"
                else
                    print_error "Application is not responding on port $PORT_DEVELOPMENT"
                    all_ok=false
                fi
            else
                print_error "Development container is not running"
                all_ok=false
            fi
            ;;
            
        both)
            # Check production
            if docker ps | grep -q sada_app; then
                print_success "Production container is running"
                wait_for_healthy "sada_app" 60 || all_ok=false
            else
                print_error "Production container is not running"
                all_ok=false
            fi
            
            # Check development
            if docker ps | grep -q sada_app_dev; then
                print_success "Development container is running"
                wait_for_healthy "sada_app_dev" 60 || all_ok=false
            else
                print_error "Development container is not running"
                all_ok=false
            fi
            ;;
    esac
    
    if [ "$all_ok" = true ]; then
        return 0
    else
        return 1
    fi
}

# ============================================================================
# FINAL INFORMATION
# ============================================================================

show_success_message() {
    separator
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║                    ✓ Setup Complete! 🎉                       ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    case $DEPLOYMENT_MODE in
        production)
            echo -e "${CYAN}🌐 Access your application:${NC}"
            echo "   http://localhost:$PORT_PRODUCTION"
            echo ""
            ;;
        development)
            echo -e "${CYAN}🌐 Access your application:${NC}"
            echo "   http://localhost:$PORT_DEVELOPMENT"
            echo ""
            ;;
        both)
            echo -e "${CYAN}🌐 Access your applications:${NC}"
            echo "   Production:  http://localhost:$PORT_PRODUCTION"
            echo "   Development: http://localhost:$PORT_DEVELOPMENT"
            echo ""
            ;;
    esac
    
    echo -e "${CYAN}👤 Default Credentials:${NC}"
    echo "   Username: berdoz"
    echo "   Password: berdoz@code"
    echo ""
    echo -e "${RED}⚠️  Please change these credentials immediately!${NC}"
    echo ""
    separator
    
    echo -e "${YELLOW}📝 Useful Commands:${NC}"
    echo ""
    echo "  View logs:"
    echo "    docker-compose logs -f app"
    echo ""
    echo "  Stop containers:"
    echo "    docker-compose down"
    echo ""
    echo "  Restart containers:"
    echo "    docker-compose restart"
    echo ""
    echo "  Health check:"
    echo "    ./docker-health-check.sh"
    echo ""
    echo "  Interactive management:"
    echo "    ./docker-start.sh"
    echo ""
    separator
    
    echo -e "${CYAN}📚 Documentation:${NC}"
    echo "  - Complete guide: DOCKER_DEPLOYMENT.md"
    echo "  - Quick reference: DOCKER_QUICK_REFERENCE.md"
    echo "  - Main README: README.md"
    echo ""
    separator
}

show_failure_message() {
    separator
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                                                                ║"
    echo "║                    ✗ Setup Failed                             ║"
    echo "║                                                                ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${YELLOW}📋 Troubleshooting:${NC}"
    echo ""
    echo "1. Check logs:"
    echo "   docker-compose logs"
    echo ""
    echo "2. View setup log:"
    echo "   cat $LOG_FILE"
    echo ""
    echo "3. Verify configuration:"
    echo "   ./docker-verify.sh"
    echo ""
    echo "4. Try manual setup:"
    echo "   docker-compose build --no-cache"
    echo "   docker-compose up -d"
    echo ""
    separator
}

# ============================================================================
# CLEANUP ON EXIT
# ============================================================================

cleanup() {
    if [ $? -ne 0 ]; then
        echo ""
        print_info "Setup interrupted or failed"
        echo ""
        read -p "Do you want to clean up partially created containers? (y/n): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down 2>/dev/null || true
            print_info "Cleanup completed"
        fi
    fi
}

trap cleanup EXIT

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    # Initialize log file
    echo "===== Sada Docker Setup Log =====" > "$LOG_FILE"
    echo "Started at: $(date)" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    print_header
    
    # Step 1: Check prerequisites
    print_step "Step 1/7: Checking prerequisites..."
    separator
    
    check_os
    check_docker || INSTALL_DOCKER=true
    check_docker_compose || INSTALL_COMPOSE=true
    
    # Install missing components
    if [ "$INSTALL_DOCKER" = true ]; then
        separator
        echo -e "${YELLOW}Docker is not installed.${NC}"
        read -p "Do you want to install Docker now? (y/n): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if [[ "$OS" == "linux" ]]; then
                install_docker_linux || exit 1
                print_warning "Please log out and log back in, then run this script again"
                exit 0
            elif [[ "$OS" == "macos" ]]; then
                install_docker_macos
                exit 0
            else
                print_error "Automatic installation not supported on this OS"
                print_info "Please install Docker manually from: https://www.docker.com/get-docker"
                exit 1
            fi
        else
            print_error "Docker is required to continue"
            exit 1
        fi
    fi
    
    if [ "$INSTALL_COMPOSE" = true ]; then
        separator
        read -p "Do you want to install Docker Compose now? (y/n): " -r
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_docker_compose || exit 1
        else
            print_error "Docker Compose is required to continue"
            exit 1
        fi
    fi
    
    check_docker_running || exit 1
    check_ports || exit 1
    check_disk_space || exit 1
    
    # Step 2: Setup environment
    separator
    print_step "Step 2/7: Setting up environment..."
    separator
    setup_environment
    
    # Step 3: Select deployment mode
    print_step "Step 3/7: Selecting deployment mode..."
    select_deployment_mode
    
    # Step 4: Build images
    print_step "Step 4/7: Building Docker images..."
    separator
    build_images || {
        show_failure_message
        exit 1
    }
    
    # Step 5: Start containers
    separator
    print_step "Step 5/7: Starting containers..."
    separator
    start_containers || {
        show_failure_message
        exit 1
    }
    
    # Step 6: Wait and verify
    separator
    print_step "Step 6/7: Verifying deployment..."
    sleep 3
    verify_deployment || {
        print_warning "Verification had some issues, but containers are running"
        print_info "Check logs with: docker-compose logs -f"
    }
    
    # Step 7: Show success message
    separator
    print_step "Step 7/7: Setup complete!"
    show_success_message
    
    # Save completion status
    echo "" >> "$LOG_FILE"
    echo "Setup completed at: $(date)" >> "$LOG_FILE"
    echo "Deployment mode: $DEPLOYMENT_MODE" >> "$LOG_FILE"
}

# Check if script is run with sudo (not recommended)
if [ "$EUID" -eq 0 ]; then 
    print_warning "Running as root is not recommended"
    read -p "Continue anyway? (y/n): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Run main function
main

exit 0