#!/bin/bash

# SADA Project Quick Development Setup
# This script quickly sets up the development environment after main installation
# Run this after running setup-ubuntu.sh

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DEV]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo
echo -e "${GREEN}🚀 SADA Development Environment Setup${NC}"
echo

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the SADA project root directory"
    exit 1
fi

# Install/update dependencies
print_status "Installing latest dependencies..."
yarn install

# Check MongoDB connection
print_status "Checking MongoDB connection..."
if systemctl is-active --quiet mongod; then
    print_success "MongoDB is running"
else
    print_warning "Starting MongoDB..."
    sudo systemctl start mongod
fi

# Seed database if needed
if [ -f "scripts/seedDatabase.js" ]; then
    print_status "Setting up database with sample data..."
    node scripts/seedDatabase.js
fi

# Create uploads directory
mkdir -p public/uploads
chmod 755 public/uploads

# Set up environment
if [ ! -f ".env.local" ] && [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    print_success "Environment file created from example"
fi

# Start development server
print_success "Development environment ready!"
echo
echo -e "${GREEN}To start the development server:${NC}"
echo -e "${BLUE}yarn dev${NC}"
echo
echo -e "${GREEN}The application will be available at:${NC}"
echo -e "${BLUE}http://localhost:3000${NC}"
echo