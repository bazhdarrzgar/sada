#!/bin/bash

# SADA2 Docker Setup Script
# This script automates the Docker setup process for the SADA2 application
# Author: Generated for SADA2 project
# Version: 1.0

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

# Function to check if port is in use
check_port() {
    local port=$1
    if ss -tlnp | grep -q ":$port "; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to stop local MongoDB if running
stop_local_mongodb() {
    print_status "Checking for local MongoDB service..."
    if systemctl is-active --quiet mongod 2>/dev/null; then
        print_warning "Local MongoDB service is running on port 27017"
        print_status "Stopping local MongoDB service..."
        sudo systemctl stop mongod
        print_success "Local MongoDB service stopped"
    else
        print_status "No local MongoDB service found"
    fi
}

# Function to check Docker installation
check_docker() {
    print_status "Checking Docker installation..."
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Function to check if user is in docker group
check_docker_permissions() {
    if ! groups $USER | grep -q docker; then
        print_warning "User $USER is not in the docker group"
        print_status "You may need to use 'sudo' for Docker commands"
        print_status "To add yourself to docker group (requires logout/login):"
        print_status "sudo usermod -aG docker $USER"
    else
        print_success "User $USER has Docker permissions"
    fi
}

# Function to generate lockfile
generate_lockfile() {
    print_status "Checking for package lockfile..."
    
    if [ -f "package-lock.json" ]; then
        print_success "package-lock.json already exists"
    elif [ -f "yarn.lock" ]; then
        print_success "yarn.lock already exists"
    elif [ -f "pnpm-lock.yaml" ]; then
        print_success "pnpm-lock.yaml already exists"
    else
        print_warning "No lockfile found. Generating package-lock.json..."
        if [ -f "package.json" ]; then
            npm install
            print_success "Generated package-lock.json"
        else
            print_error "package.json not found. Cannot generate lockfile."
            exit 1
        fi
    fi
}

# Function to check port conflicts
check_ports() {
    print_status "Checking for port conflicts..."
    
    if check_port 27017; then
        print_warning "Port 27017 is already in use"
        stop_local_mongodb
    else
        print_success "Port 27017 is available"
    fi
    
    if check_port 3000; then
        print_warning "Port 3000 is already in use"
        print_status "You may need to stop the service using port 3000 or change the port in docker-compose.yml"
    else
        print_success "Port 3000 is available"
    fi
}

# Function to build and start containers
start_containers() {
    print_status "Building and starting Docker containers..."
    
    # Use sudo if user is not in docker group
    if groups $USER | grep -q docker; then
        DOCKER_CMD="docker-compose"
    else
        DOCKER_CMD="sudo docker-compose"
        print_status "Using sudo for Docker commands"
    fi
    
    # Build and start containers
    $DOCKER_CMD up -d --build
    
    print_success "Docker containers started successfully"
}

# Function to wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Determine Docker command with proper permissions
    if groups $USER | grep -q docker; then
        DOCKER_CMD="docker-compose"
    else
        DOCKER_CMD="sudo docker-compose"
    fi
    
    # Wait for MongoDB
    print_status "Waiting for MongoDB to be healthy..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if $DOCKER_CMD ps mongodb | grep -q "healthy"; then
            print_success "MongoDB is healthy"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "MongoDB failed to become healthy after $max_attempts attempts"
            return 1
        fi
        
        print_status "Attempt $attempt/$max_attempts - MongoDB not ready yet..."
        sleep 2
        ((attempt++))
    done
    
    # Wait for application
    print_status "Waiting for application to be ready..."
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000 >/dev/null 2>&1; then
            print_success "Application is ready"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_warning "Application may not be ready yet, but containers are running"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - Application not ready yet..."
        sleep 3
        ((attempt++))
    done
}

# Function to show container status
show_status() {
    # Determine Docker command with proper permissions
    if groups $USER | grep -q docker; then
        DOCKER_CMD="docker-compose"
    else
        DOCKER_CMD="sudo docker-compose"
    fi
    
    print_status "Container Status:"
    $DOCKER_CMD ps
    
    echo ""
    print_status "Application URLs:"
    echo "  - Main Application: http://localhost:3000"
    echo "  - MongoDB: localhost:27017"
    
    echo ""
    print_status "Useful Commands:"
    echo "  - View logs: $DOCKER_CMD logs -f"
    echo "  - Stop containers: $DOCKER_CMD down"
    echo "  - Restart containers: $DOCKER_CMD restart"
    echo "  - View container status: $DOCKER_CMD ps"
}

# Function to show help
show_help() {
    echo "SADA2 Docker Setup Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -s, --status   Show container status only"
    echo "  -c, --clean    Clean up containers and volumes"
    echo "  -r, --restart  Restart containers"
    echo "  -l, --logs     Show container logs"
    echo ""
    echo "Examples:"
    echo "  $0              # Full setup"
    echo "  $0 --status     # Show status only"
    echo "  $0 --clean      # Clean up everything"
    echo "  $0 --restart    # Restart containers"
}

# Function to clean up
cleanup() {
    # Determine Docker command with proper permissions
    if groups $USER | grep -q docker; then
        DOCKER_CMD="docker-compose"
    else
        DOCKER_CMD="sudo docker-compose"
    fi
    
    print_status "Cleaning up Docker containers and volumes..."
    $DOCKER_CMD down -v
    print_success "Cleanup completed"
}

# Function to restart containers
restart_containers() {
    # Determine Docker command with proper permissions
    if groups $USER | grep -q docker; then
        DOCKER_CMD="docker-compose"
    else
        DOCKER_CMD="sudo docker-compose"
    fi
    
    print_status "Restarting containers..."
    $DOCKER_CMD restart
    print_success "Containers restarted"
}

# Function to show logs
show_logs() {
    # Determine Docker command with proper permissions
    if groups $USER | grep -q docker; then
        DOCKER_CMD="docker-compose"
    else
        DOCKER_CMD="sudo docker-compose"
    fi
    
    print_status "Showing container logs (Press Ctrl+C to exit)..."
    $DOCKER_CMD logs -f
}

# Main function
main() {
    echo "=========================================="
    echo "    SADA2 Docker Setup Script v1.0"
    echo "=========================================="
    echo ""
    
    # Parse command line arguments
    case "${1:-}" in
        -h|--help)
            show_help
            exit 0
            ;;
        -s|--status)
            show_status
            exit 0
            ;;
        -c|--clean)
            cleanup
            exit 0
            ;;
        -r|--restart)
            restart_containers
            exit 0
            ;;
        -l|--logs)
            show_logs
            exit 0
            ;;
        "")
            # No arguments, run full setup
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
    
    # Run full setup
    print_status "Starting SADA2 Docker setup..."
    
    # Pre-flight checks
    check_docker
    check_docker_permissions
    generate_lockfile
    check_ports
    
    # Start services
    start_containers
    wait_for_services
    
    # Show final status
    echo ""
    show_status
    
    echo ""
    print_success "SADA2 Docker setup completed successfully!"
    print_status "You can now access the application at: http://localhost:3000"
}

# Run main function with all arguments
main "$@"