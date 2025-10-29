#!/bin/bash

# ============================================================================
# Sada Quick Setup - Get Running in 1 Minute!
# ============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║   🚀 Sada Quick Setup                     ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Quick checks
echo -e "${YELLOW}Checking requirements...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker not found${NC}"
    echo ""
    echo "Please install Docker first:"
    echo "  Linux:   curl -fsSL https://get.docker.com | sh"
    echo "  macOS:   brew install --cask docker"
    echo "  Windows: Download from docker.com"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is ready${NC}"
echo ""

# Check ports
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${RED}✗ Port 3000 is in use${NC}"
    echo "Please stop the service using port 3000 first"
    exit 1
fi

echo -e "${GREEN}✓ Port 3000 is available${NC}"
echo ""

# Create .env if needed
if [ ! -f .env ] && [ -f .env.example ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Environment configured${NC}"
    echo ""
fi

# Start deployment
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Starting Sada in production mode...${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo ""

# Build and start
docker-compose up -d app

# Wait for health
echo ""
echo -e "${YELLOW}Waiting for application to start...${NC}"
sleep 10

# Check if running
if docker ps | grep -q sada_app; then
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   ✓ Sada is Running! 🎉                   ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${BLUE}🌐 Access:${NC}    http://localhost:3000"
    echo -e "${BLUE}👤 Username:${NC} berdoz"
    echo -e "${BLUE}🔑 Password:${NC} berdoz@code"
    echo ""
    echo -e "${RED}⚠️  Change these credentials after login!${NC}"
    echo ""
    echo -e "${YELLOW}Useful commands:${NC}"
    echo "  View logs:  docker-compose logs -f app"
    echo "  Stop:       docker-compose down"
    echo "  Restart:    docker-compose restart app"
    echo ""
else
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════╗"
    echo "║   ✗ Something went wrong                  ║"
    echo "╚════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo "Check logs: docker-compose logs app"
    echo "Or use full setup: ./docker-setup.sh"
    exit 1
fi

exit 0
