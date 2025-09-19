#!/bin/bash

# Simple Docker setup script with build fixes
# This script addresses the "lockfile not found" error

set -e

echo "🐳 Simple Docker Setup for Sada"
echo "================================"

# Check Docker availability
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed or not in PATH"
    echo "Please install Docker Compose first"
    exit 1
fi

echo "✅ Docker is available"

# Verify essential files
echo "🔍 Checking essential files..."

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found!"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    exit 1
fi

# Check for lockfiles
LOCKFILE_FOUND=false
if [ -f "yarn.lock" ]; then
    echo "✅ Found yarn.lock"
    LOCKFILE_FOUND=true
fi

if [ -f "package-lock.json" ]; then
    echo "✅ Found package-lock.json"
    LOCKFILE_FOUND=true
fi

if [ "$LOCKFILE_FOUND" = false ]; then
    echo "⚠️  No lockfile found. Creating one..."
    if command -v yarn &> /dev/null; then
        echo "📦 Installing dependencies with yarn..."
        yarn install
    else
        echo "📦 Installing dependencies with npm..."
        npm install
    fi
fi

# Setup upload permissions
echo "📁 Setting up upload directories..."
mkdir -p ./public/upload/{uploads,images,videos,documents,Image_Activity,Image_Psl,docker_test_images,driver_videos,license_images,test,test_images}

# Fix permissions (try with sudo, fallback to current user)
echo "🔧 Fixing upload permissions..."
if sudo chown -R 1001:1001 ./public/upload 2>/dev/null; then
    echo "✅ Set ownership to 1001:1001 (nextjs user)"
else
    echo "⚠️  Setting ownership to current user ($(id -u):$(id -g))"
    chown -R $(id -u):$(id -g) ./public/upload
fi

chmod -R 755 ./public/upload

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean build (no cache)
echo "🔨 Building Docker image (clean build)..."
if docker-compose build --no-cache; then
    echo "✅ Docker build successful"
else
    echo ""
    echo "❌ Docker build failed. Troubleshooting:"
    echo "1. Check if all files are present:"
    ls -la | grep -E "(package\.json|yarn\.lock|package-lock\.json|Dockerfile)"
    echo ""
    echo "2. Try manual build for more details:"
    echo "   docker build -t sada-test . --no-cache"
    echo ""
    echo "3. Check the DOCKER_BUILD_FIX.md guide for solutions"
    echo ""
    exit 1
fi

# Start services
echo "🚀 Starting services..."

# Start MongoDB first
echo "📊 Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB
echo "⏳ Waiting for MongoDB to be ready..."
sleep 15

# Start the application
echo "🌐 Starting application..."
docker-compose up -d app

# Wait for application
echo "⏳ Waiting for application to start..."
sleep 20

# Check status
echo "📊 Checking service status..."
docker-compose ps

# Test application
echo "🧪 Testing application..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is responding!"
else
    echo "⚠️  Application may still be starting. Check logs:"
    echo "   docker-compose logs -f app"
fi

echo ""
echo "🎉 Setup complete!"
echo "🌐 Application: http://localhost:3000"
echo "🔐 Login: berdoz / berdoz@code"
echo "📂 Upload directory ready with proper permissions"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f app     # View app logs"
echo "  docker-compose ps              # Check status"
echo "  ./diagnose-upload-issue.sh     # Test uploads"
echo "  docker-compose down            # Stop services"