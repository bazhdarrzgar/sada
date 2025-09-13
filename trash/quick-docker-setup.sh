#!/bin/bash

# 🚀 Quick Docker Setup Script for Berdoz Management System (SADA)
# This script automates the entire Docker setup process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker installation
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed and running"
}

# Function to check system requirements
check_system() {
    print_status "Checking system requirements..."
    
    # Check available memory (at least 2GB recommended)
    if command_exists free; then
        AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        if [ "$AVAILABLE_MEM" -lt 2048 ]; then
            print_warning "Available memory is less than 2GB. Application may run slowly."
        fi
    fi
    
    # Check available disk space (at least 10GB recommended)
    AVAILABLE_SPACE=$(df . | awk 'NR==2{print $4}')
    if [ "$AVAILABLE_SPACE" -lt 10485760 ]; then  # 10GB in KB
        print_warning "Available disk space is less than 10GB."
    fi
    
    print_success "System requirements check completed"
}

# Function to setup dependencies
setup_dependencies() {
    print_status "Setting up Node.js dependencies..."
    
    if [ -f "yarn.lock" ]; then
        if command_exists yarn; then
            yarn install
            print_success "Dependencies installed with Yarn"
        else
            print_warning "yarn.lock found but Yarn is not installed. Using npm instead."
            npm install
        fi
    elif [ -f "package-lock.json" ]; then
        npm install
        print_success "Dependencies installed with NPM"
    else
        print_status "No lockfile found. Installing with preferred package manager..."
        if command_exists yarn; then
            yarn install
        else
            npm install
        fi
        print_success "Dependencies installed and lockfile generated"
    fi
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p public/upload
    chmod 755 public/upload
    
    print_success "Directories created"
}

# Function to handle environment setup
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        print_status "Creating default .env file..."
        cat > .env << EOF
# Production Environment Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Database Configuration
MONGODB_URI=mongodb://mongodb:27017/sada
MONGO_URL=mongodb://mongodb:27017/sada
MONGO_INITDB_DATABASE=sada

# Security (Change in production!)
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=change_this_password_in_production

# Application Configuration
UPLOAD_MAX_SIZE=10MB
SESSION_SECRET=change_this_secret_in_production
EOF
        print_success "Default .env file created"
        print_warning "⚠️  Please update .env file with production values before deploying!"
    else
        print_success "Environment file already exists"
    fi
}

# Function to check Docker permissions
check_docker_permissions() {
    if groups "$USER" | grep -q docker; then
        USE_SUDO=false
    else
        USE_SUDO=true
        print_warning "User not in docker group. Using sudo for Docker commands."
    fi
}

# Function to start Docker services
start_services() {
    print_status "Starting Docker services..."
    
    # Stop local MongoDB if running
    if systemctl is-active --quiet mongod 2>/dev/null; then
        print_status "Stopping local MongoDB service..."
        sudo systemctl stop mongod
    fi
    
    # Stop any existing containers
    if [ "$USE_SUDO" = true ]; then
        sudo docker-compose down >/dev/null 2>&1 || true
        sudo docker-compose up -d --build
    else
        docker-compose down >/dev/null 2>&1 || true
        docker-compose up -d --build
    fi
    
    print_success "Docker services started"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for MongoDB to be healthy
    print_status "Waiting for MongoDB to initialize..."
    timeout=120
    count=0
    while [ $count -lt $timeout ]; do
        if [ "$USE_SUDO" = true ]; then
            if sudo docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
                print_success "MongoDB is ready"
                break
            fi
        else
            if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
                print_success "MongoDB is ready"
                break
            fi
        fi
        sleep 2
        count=$((count + 2))
        if [ $((count % 10)) -eq 0 ]; then
            print_status "Still waiting for MongoDB... ($count/${timeout}s)"
        fi
    done
    
    if [ $count -ge $timeout ]; then
        print_error "MongoDB failed to start within $timeout seconds"
        return 1
    fi
    
    # Wait for Application to be ready
    print_status "Waiting for application to be ready..."
    timeout=60
    count=0
    while [ $count -lt $timeout ]; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_success "Application is ready"
            break
        fi
        sleep 2
        count=$((count + 2))
        if [ $((count % 10)) -eq 0 ]; then
            print_status "Still waiting for application... ($count/${timeout}s)"
        fi
    done
    
    if [ $count -ge $timeout ]; then
        print_error "Application failed to start within $timeout seconds"
        return 1
    fi
}

# Function to display final information
show_completion_info() {
    echo
    echo "🎉 Setup completed successfully!"
    echo
    echo "📋 Service Information:"
    echo "  • Application URL: http://localhost:3000"
    echo "  • MongoDB URL: mongodb://localhost:27017/sada"
    echo "  • Development URL: http://localhost:3000 (use --profile dev)"
    echo
    echo "🔧 Useful Commands:"
    if [ "$USE_SUDO" = true ]; then
        echo "  • View logs: sudo docker-compose logs -f"
        echo "  • Stop services: sudo docker-compose down"
        echo "  • Start dev mode: sudo docker-compose --profile dev up -d"
        echo "  • Access MongoDB: sudo docker-compose exec mongodb mongosh sada"
    else
        echo "  • View logs: docker-compose logs -f"
        echo "  • Stop services: docker-compose down"
        echo "  • Start dev mode: docker-compose --profile dev up -d"
        echo "  • Access MongoDB: docker-compose exec mongodb mongosh sada"
    fi
    echo
    echo "📁 Important Files:"
    echo "  • Environment: .env"
    echo "  • Logs: docker-compose logs"
    echo "  • Uploads: ./public/upload/"
    echo
    print_success "Berdoz Management System is now running!"
    echo
}

# Function to display help
show_help() {
    echo "🚀 Quick Docker Setup Script for Berdoz Management System"
    echo
    echo "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -d, --dev      Start in development mode"
    echo "  --skip-deps    Skip dependency installation"
    echo "  --skip-build   Skip Docker build process"
    echo "  -v, --verbose  Enable verbose output"
    echo
    echo "Examples:"
    echo "  $0                 # Standard setup"
    echo "  $0 --dev           # Setup with development profile"
    echo "  $0 --skip-deps     # Skip npm/yarn install"
    echo
}

# Main execution function
main() {
    local SKIP_DEPS=false
    local SKIP_BUILD=false
    local DEV_MODE=false
    local VERBOSE=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -d|--dev)
                DEV_MODE=true
                shift
                ;;
            --skip-deps)
                SKIP_DEPS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                set -x  # Enable bash debugging
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🚀 Berdoz Management System - Docker Setup"
    echo "==========================================="
    echo
    
    # Execute setup steps
    check_docker
    check_system
    check_docker_permissions
    
    if [ "$SKIP_DEPS" = false ]; then
        setup_dependencies
    else
        print_warning "Skipping dependency installation"
    fi
    
    create_directories
    setup_environment
    
    if [ "$SKIP_BUILD" = false ]; then
        if [ "$DEV_MODE" = true ]; then
            print_status "Starting in development mode..."
            if [ "$USE_SUDO" = true ]; then
                sudo docker-compose --profile dev up -d --build
            else
                docker-compose --profile dev up -d --build
            fi
        else
            start_services
        fi
        
        wait_for_services
    else
        print_warning "Skipping Docker build and start"
    fi
    
    show_completion_info
    
    if [ "$DEV_MODE" = true ]; then
        echo "🔧 Development mode is active on port 3000"
    fi
}

# Trap to handle interruptions
trap 'print_error "Setup interrupted"; exit 1' INT TERM

# Run main function with all arguments
main "$@"
