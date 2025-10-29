#!/bin/bash

# Docker Port 3000 Issue Fix Script
# This script fixes the Docker container restart issue and ensures port 3000 works

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

echo "🔧 Docker Port 3000 Issue Fix"
echo "==============================="

# Check if we need sudo for docker commands
if groups $USER | grep -q docker 2>/dev/null; then
    DOCKER_CMD="docker"
    COMPOSE_CMD="docker-compose"
else
    DOCKER_CMD="sudo docker"
    COMPOSE_CMD="sudo docker-compose"
    print_warning "Using sudo for Docker commands"
fi

# Step 1: Stop failing containers
print_status "Step 1: Stopping failing containers..."
$COMPOSE_CMD down 2>/dev/null || true
print_success "Containers stopped"

# Step 2: Check container logs for debugging
print_status "Step 2: Checking previous container logs..."
if $DOCKER_CMD ps -a | grep -q "sada_app"; then
    print_status "Previous app container logs:"
    $DOCKER_CMD logs sada_app --tail=10 2>/dev/null || echo "No logs available"
fi

# Step 3: Clean up problematic containers and images
print_status "Step 3: Cleaning up problematic containers..."
$DOCKER_CMD container prune -f 2>/dev/null || true
print_success "Container cleanup complete"

# Step 4: Rebuild with fixed entrypoint
print_status "Step 4: Rebuilding with fixed entrypoint..."
$COMPOSE_CMD build --no-cache app
print_success "Rebuild complete"

# Step 5: Start containers
print_status "Step 5: Starting containers with fixed configuration..."
$COMPOSE_CMD up -d

# Step 6: Enhanced waiting with detailed logging
print_status "Step 6: Waiting for services with enhanced monitoring..."

# Wait for MongoDB
print_status "Waiting for MongoDB..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if $COMPOSE_CMD ps mongodb | grep -q "healthy\|Up"; then
        print_success "MongoDB is ready"
        break
    fi
    if [ $attempt -eq $max_attempts ]; then
        print_error "MongoDB failed to start"
        $COMPOSE_CMD logs mongodb --tail=10
        exit 1
    fi
    echo -n "."
    sleep 2
    ((attempt++))
done

# Wait for application with detailed checking
print_status "Waiting for application on port 3000..."
attempt=1
while [ $attempt -le 60 ]; do
    # Check container status
    container_status=$($COMPOSE_CMD ps app --format "table {{.Status}}" | tail -n +2 | head -1)
    
    if echo "$container_status" | grep -q "Up"; then
        # Container is up, test HTTP
        if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
            print_success "Application is ready on port 3000!"
            break
        else
            echo -n "🌐"
        fi
    elif echo "$container_status" | grep -q "Restart"; then
        print_warning "Container is restarting (attempt $attempt/60)"
        # Show recent logs if restarting
        if [ $((attempt % 10)) -eq 0 ]; then
            print_status "Recent logs:"
            $COMPOSE_CMD logs app --tail=5
        fi
    else
        print_warning "Container status: $container_status"
    fi
    
    if [ $attempt -eq 60 ]; then
        print_error "Application failed to start after 60 attempts"
        print_status "Final container status:"
        $COMPOSE_CMD ps
        print_status "Application logs:"
        $COMPOSE_CMD logs app --tail=20
        exit 1
    fi
    
    sleep 2
    ((attempt++))
done

# Step 7: Verify everything is working
print_status "Step 7: Final verification..."
echo ""
print_success "🎉 Docker setup fixed successfully!"

# Show status
print_status "Container Status:"
$COMPOSE_CMD ps

echo ""
print_status "Application URLs:"
echo "  - Main Application: http://localhost:3000"
echo "  - MongoDB: localhost:27017"

echo ""
print_status "Quick Tests:"
echo "  - Port 3000 accessible: $(curl -f -s http://localhost:3000 >/dev/null 2>&1 && echo "✅ YES" || echo "❌ NO")"
echo "  - Container running: $(docker ps | grep -q "sada_app.*Up" && echo "✅ YES" || echo "❌ NO")"

echo ""
print_success "Issue resolved! Your application should now be accessible at http://localhost:3000"

echo ""
print_status "Useful commands for monitoring:"
echo "  - Check status: $COMPOSE_CMD ps"
echo "  - View logs: $COMPOSE_CMD logs -f app"
echo "  - Restart if needed: $COMPOSE_CMD restart app"