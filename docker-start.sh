#!/bin/bash

# Sada Docker Quick Start Script
# This script helps you quickly deploy Sada using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════╗"
    echo "║   🏫 Sada School Management System           ║"
    echo "║   Docker Deployment Script                   ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    print_success "Docker is installed"
}

check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    print_success "Docker Compose is installed"
}

check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        print_error "Port $port is already in use"
        echo "Please stop the service using port $port or change the port in docker-compose.yml"
        return 1
    fi
    return 0
}

show_menu() {
    echo ""
    echo "Select deployment mode:"
    echo "1) Production (recommended for deployment)"
    echo "2) Development (with hot reload)"
    echo "3) Stop all containers"
    echo "4) View logs"
    echo "5) Backup database"
    echo "6) Restart containers"
    echo "7) Remove all containers and data"
    echo "8) Exit"
    echo ""
}

start_production() {
    print_info "Starting production deployment..."
    
    if ! check_port 3000; then
        return 1
    fi
    
    docker-compose up -d app
    
    print_success "Production container started!"
    echo ""
    print_info "Waiting for application to be ready..."
    sleep 5
    
    echo ""
    print_success "Application is ready!"
    echo ""
    echo "═══════════════════════════════════════════════"
    echo "  Access your application at:"
    echo "  🌐 http://localhost:3000"
    echo ""
    echo "  Default credentials:"
    echo "  👤 Username: berdoz"
    echo "  🔑 Password: berdoz@code"
    echo ""
    echo "  ⚠️  Please change these credentials immediately!"
    echo "═══════════════════════════════════════════════"
    echo ""
    print_info "To view logs: docker-compose logs -f app"
    print_info "To stop: docker-compose down"
}

start_development() {
    print_info "Starting development deployment..."
    
    if ! check_port 3001; then
        return 1
    fi
    
    docker-compose --profile dev up -d app-dev
    
    print_success "Development container started!"
    echo ""
    print_info "Waiting for application to be ready..."
    sleep 8
    
    echo ""
    print_success "Application is ready with hot reload enabled!"
    echo ""
    echo "═══════════════════════════════════════════════"
    echo "  Access your application at:"
    echo "  🌐 http://localhost:3001"
    echo ""
    echo "  Changes to code will automatically reload"
    echo "═══════════════════════════════════════════════"
    echo ""
    print_info "To view logs: docker-compose logs -f app-dev"
    print_info "To stop: docker-compose down"
}

stop_containers() {
    print_info "Stopping all containers..."
    docker-compose down
    print_success "All containers stopped"
}

view_logs() {
    echo "Select which logs to view:"
    echo "1) Production logs"
    echo "2) Development logs"
    read -p "Enter choice: " log_choice
    
    case $log_choice in
        1)
            print_info "Showing production logs (Ctrl+C to exit)..."
            docker-compose logs -f --tail=100 app
            ;;
        2)
            print_info "Showing development logs (Ctrl+C to exit)..."
            docker-compose logs -f --tail=100 app-dev
            ;;
        *)
            print_error "Invalid choice"
            ;;
    esac
}

backup_database() {
    local backup_file="backup-$(date +%Y%m%d-%H%M%S).db"
    print_info "Creating database backup: $backup_file"
    
    if docker ps | grep -q sada_app; then
        docker cp sada_app:/app/database/sada.db "./$backup_file"
        print_success "Database backed up to: $backup_file"
    else
        print_error "Container is not running. Start the application first."
    fi
}

restart_containers() {
    print_info "Restarting containers..."
    docker-compose restart
    print_success "Containers restarted"
}

remove_all() {
    echo ""
    print_error "⚠️  WARNING: This will remove all containers and data!"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    
    if [ "$confirm" = "yes" ]; then
        print_info "Removing all containers and volumes..."
        docker-compose down -v
        print_success "All containers and data removed"
    else
        print_info "Operation cancelled"
    fi
}

# Main script
main() {
    print_header
    
    # Check prerequisites
    print_info "Checking prerequisites..."
    check_docker
    check_docker_compose
    echo ""
    
    while true; do
        show_menu
        read -p "Enter your choice [1-8]: " choice
        
        case $choice in
            1)
                start_production
                ;;
            2)
                start_development
                ;;
            3)
                stop_containers
                ;;
            4)
                view_logs
                ;;
            5)
                backup_database
                ;;
            6)
                restart_containers
                ;;
            7)
                remove_all
                ;;
            8)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Run main function
main
