#!/bin/bash

# Docker Health Check Script for Sada
# This script checks the health of your Docker deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════╗"
    echo "║   🏥 Sada Health Check                       ║"
    echo "╚═══════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_container_running() {
    local container=$1
    if docker ps --format '{{.Names}}' | grep -q "^${container}$"; then
        print_success "Container '$container' is running"
        return 0
    else
        print_error "Container '$container' is not running"
        return 1
    fi
}

check_container_health() {
    local container=$1
    local health=$(docker inspect --format='{{.State.Health.Status}}' $container 2>/dev/null)
    
    if [ -z "$health" ]; then
        print_info "Container '$container' has no health check defined"
        return 0
    fi
    
    if [ "$health" = "healthy" ]; then
        print_success "Container '$container' is healthy"
        return 0
    else
        print_error "Container '$container' health status: $health"
        return 1
    fi
}

check_http_endpoint() {
    local url=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        print_success "HTTP endpoint $url is responding (200 OK)"
        return 0
    else
        print_error "HTTP endpoint $url returned: $response"
        return 1
    fi
}

check_database() {
    local container=$1
    if docker exec $container test -f /app/database/sada.db 2>/dev/null; then
        local db_size=$(docker exec $container du -h /app/database/sada.db 2>/dev/null | cut -f1)
        print_success "SQLite database exists (size: $db_size)"
        return 0
    else
        print_error "SQLite database not found"
        return 1
    fi
}

check_uploads_directory() {
    local container=$1
    if docker exec $container test -d /app/public/upload 2>/dev/null; then
        print_success "Uploads directory exists"
        return 0
    else
        print_error "Uploads directory not found"
        return 1
    fi
}

show_container_stats() {
    local container=$1
    echo ""
    print_info "Resource usage for $container:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $container
}

show_recent_logs() {
    local container=$1
    echo ""
    print_info "Recent logs for $container (last 10 lines):"
    docker logs --tail 10 $container 2>&1
}

# Main health check
main() {
    print_header
    echo ""
    
    local overall_health=0
    
    # Check if production container is running
    if docker ps --format '{{.Names}}' | grep -q "sada_app"; then
        CONTAINER="sada_app"
        print_info "Checking production deployment..."
        echo ""
        
        check_container_running $CONTAINER || overall_health=1
        check_container_health $CONTAINER || overall_health=1
        check_http_endpoint "http://localhost:3000" || overall_health=1
        check_database $CONTAINER || overall_health=1
        check_uploads_directory $CONTAINER || overall_health=1
        
        show_container_stats $CONTAINER
        
        if [ "$1" = "-v" ] || [ "$1" = "--verbose" ]; then
            show_recent_logs $CONTAINER
        fi
        
    elif docker ps --format '{{.Names}}' | grep -q "sada_app_dev"; then
        CONTAINER="sada_app_dev"
        print_info "Checking development deployment..."
        echo ""
        
        check_container_running $CONTAINER || overall_health=1
        check_container_health $CONTAINER || overall_health=1
        check_http_endpoint "http://localhost:3001" || overall_health=1
        check_database $CONTAINER || overall_health=1
        check_uploads_directory $CONTAINER || overall_health=1
        
        show_container_stats $CONTAINER
        
        if [ "$1" = "-v" ] || [ "$1" = "--verbose" ]; then
            show_recent_logs $CONTAINER
        fi
        
    else
        print_error "No Sada containers are running"
        echo ""
        print_info "To start the application:"
        echo "  Production: docker-compose up -d app"
        echo "  Development: docker-compose --profile dev up -d app-dev"
        exit 1
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════"
    
    if [ $overall_health -eq 0 ]; then
        print_success "All health checks passed! 🎉"
    else
        print_error "Some health checks failed. Please review the output above."
        echo ""
        print_info "Troubleshooting tips:"
        echo "  - View logs: docker-compose logs -f"
        echo "  - Restart: docker-compose restart"
        echo "  - Rebuild: docker-compose up -d --build"
    fi
    
    echo "═══════════════════════════════════════════════"
    echo ""
    
    exit $overall_health
}

# Show usage
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo "Usage: $0 [-v|--verbose] [-h|--help]"
    echo ""
    echo "Options:"
    echo "  -v, --verbose    Show recent container logs"
    echo "  -h, --help       Show this help message"
    exit 0
fi

main "$@"
