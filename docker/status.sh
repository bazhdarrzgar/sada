#!/bin/bash

# Quick status check for Sada

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}  Sada Status${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Check if any Sada containers are running
if docker ps --format '{{.Names}}' | grep -q "sada"; then
    echo -e "${GREEN}✓ Sada is running${NC}"
    echo ""
    
    # Show running containers
    echo -e "${YELLOW}Running containers:${NC}"
    docker ps --filter "name=sada" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    
    # Show access URLs
    if docker ps --format '{{.Names}}' | grep -q "sada_app"; then
        echo -e "${BLUE}🌐 Production:${NC} http://localhost:3000"
    fi
    
    if docker ps --format '{{.Names}}' | grep -q "sada_app_dev"; then
        echo -e "${BLUE}🌐 Development:${NC} http://localhost:3001"
    fi
    echo ""
    
    # Show resource usage
    echo -e "${YELLOW}Resource usage:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker ps --filter "name=sada" --format "{{.Names}}")
    echo ""
    
    # Quick commands
    echo -e "${YELLOW}Quick commands:${NC}"
    echo "  View logs:   docker-compose logs -f app"
    echo "  Stop:        docker-compose down"
    echo "  Restart:     docker-compose restart"
    echo "  Health:      ./docker-health-check.sh"
    
else
    echo -e "${RED}✗ Sada is not running${NC}"
    echo ""
    echo -e "${YELLOW}To start Sada:${NC}"
    echo "  Quick:    ./quick-setup.sh"
    echo "  Full:     ./docker-setup.sh"
    echo "  Manual:   docker-compose up -d app"
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
