#!/bin/bash

# Sada Project Startup Script
# Supports multiple deployment modes

set -e

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

# Function to show usage
show_usage() {
    echo "Sada Project Startup Script"
    echo ""
    echo "Usage: $0 [MODE] [OPTIONS]"
    echo ""
    echo "Modes:"
    echo "  dev         Start in development mode (hot reload)"
    echo "  prod        Start in production mode"
    echo "  build       Build Docker images only"
    echo "  stop        Stop all services"
    echo "  clean       Stop and remove everything"
    echo ""
    echo "Options:"
    echo "  --logs      Show logs after starting"
    echo "  --help      Show this help message"
    echo ""
}

# Parse command line arguments
MODE="$1"
SHOW_LOGS=false

for arg in "$@"; do
    case $arg in
        --logs)
            SHOW_LOGS=true
            ;;
        --help)
            show_usage
            exit 0
            ;;
    esac
done

# Check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are available"
}

# Development mode
start_dev() {
    print_status "Starting Sada project in development mode..."
    check_docker
    
    print_status "Building development images..."
    docker-compose --profile dev build app-dev
    
    print_status "Starting development services..."
    docker-compose --profile dev up -d
    
    print_success "Development mode started!"
    print_status "Application available at: http://localhost:3000"
    
    if [ "$SHOW_LOGS" = true ]; then
        print_status "Showing logs (Ctrl+C to exit logs, services keep running)..."
        docker-compose --profile dev logs -f
    fi
}

# Production mode
start_prod() {
    print_status "Starting Sada project in production mode..."
    check_docker
    
    # Check if production environment file exists
    if [ ! -f ".env.production" ]; then
        print_warning "Production environment file not found!"
        print_status "Creating .env.production from example..."
        cp .env.production.example .env.production
        print_warning "Please edit .env.production with your production values before continuing."
        print_status "Example: nano .env.production"
        exit 1
    fi
    
    print_status "Building production images..."
    docker-compose build
    
    print_status "Starting production services..."
    docker-compose up -d
    
    # Wait for services to start
    print_status "Waiting for services to initialize..."
    sleep 15
    
    # Health check
    print_status "Performing health check..."
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_success "Production mode started successfully!"
        print_status "Application available at: http://localhost:3000"
    else
        print_warning "Application may still be starting up..."
        print_status "Check logs with: docker-compose logs -f"
    fi
    
    if [ "$SHOW_LOGS" = true ]; then
        print_status "Showing logs (Ctrl+C to exit logs, services keep running)..."
        docker-compose logs -f
    fi
}

# Build only
build_only() {
    print_status "Building Sada project Docker images..."
    check_docker
    
    print_status "Building production images..."
    docker-compose build
    
    print_status "Building development images..."
    docker-compose --profile dev build
    
    print_success "All Docker images built successfully!"
}

# Stop services
stop_services() {
    print_status "Stopping Sada project services..."
    
    # Stop production services
    docker-compose down 2>/dev/null || true
    
    # Stop development services
    docker-compose --profile dev down 2>/dev/null || true
    
    print_success "All services stopped!"
}

# Clean everything
clean_all() {
    print_status "Cleaning up Sada project (removing all containers, volumes, and images)..."
    
    read -p "This will remove all data including database. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleanup cancelled."
        exit 0
    fi
    
    # Stop and remove everything
    docker-compose --profile dev down -v --remove-orphans 2>/dev/null || true
    docker-compose down -v --remove-orphans 2>/dev/null || true
    
    # Remove images
    docker images | grep sada | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
    
    print_success "Cleanup completed!"
}

# Main logic
case "$MODE" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "build")
        build_only
        ;;
    "stop")
        stop_services
        ;;
    "clean")
        clean_all
        ;;
    "")
        print_error "No mode specified!"
        echo ""
        show_usage
        exit 1
        ;;
    *)
        print_error "Unknown mode: $MODE"
        echo ""
        show_usage
        exit 1
        ;;
esac