#!/bin/bash

# Comprehensive Docker setup script with proper upload permissions
# Run this script to build and start your Docker containers with proper permissions

set -e

echo "🚀 Starting Docker setup with proper upload permissions..."

# Check if required files exist
echo "🔍 Checking required files..."
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if [ ! -f "yarn.lock" ] && [ ! -f "package-lock.json" ]; then
    echo "❌ No lockfile found (yarn.lock or package-lock.json required)!"
    exit 1
fi

if [ -f "yarn.lock" ]; then
    echo "✅ Found yarn.lock"
fi

if [ -f "package-lock.json" ]; then
    echo "✅ Found package-lock.json"
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found!"
    exit 1
fi

echo "✅ All required files present"

# Stop any running containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean up any existing volumes if needed (comment out if you want to preserve data)
# echo "🧹 Cleaning up volumes..."
# docker volume rm sada_upload_data 2>/dev/null || true

# Create upload directory structure if it doesn't exist
echo "📁 Creating upload directory structure..."
mkdir -p ./public/upload/{uploads,images,videos,documents,Image_Activity,Image_Psl,docker_test_images,driver_videos,license_images,test,test_images}

# Set proper permissions for upload directories
echo "🔧 Setting proper permissions for upload directories..."
# Use 1001:1001 which matches the nextjs user in the container
sudo chown -R 1001:1001 ./public/upload 2>/dev/null || {
    echo "⚠️  Could not set ownership to 1001:1001, trying current user..."
    chown -R $(id -u):$(id -g) ./public/upload
}

# Set proper file permissions
chmod -R 755 ./public/upload

# Build the Docker image with verbose output
echo "🔨 Building Docker image..."
docker-compose build --no-cache app || {
    echo "❌ Docker build failed. Checking common issues..."
    echo "Files in current directory:"
    ls -la
    echo ""
    echo "Docker version:"
    docker --version
    echo ""
    echo "Docker compose version:"
    docker-compose --version
    exit 1
}

# Start the services
echo "🟢 Starting services..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Start the application
echo "🟢 Starting application..."
docker-compose up -d app

# Wait for application to be ready
echo "⏳ Waiting for application to start..."
sleep 20

# Show container status
echo "📊 Container status:"
docker-compose ps

# Show upload directory permissions
echo "📂 Upload directory permissions:"
ls -la ./public/upload/

# Test if application is responding
echo "🧪 Testing application response..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Application is responding!"
else
    echo "⚠️  Application might still be starting. Check logs:"
    echo "   docker-compose logs -f app"
fi

echo ""
echo "✅ Setup complete!"
echo "🌐 Application should be available at: http://localhost:3000"
echo "📁 Upload directory: ./public/upload (owned by 1001:1001, permissions 755)"
echo ""
echo "To check logs:"
echo "  docker-compose logs -f app"
echo ""
echo "To test uploads:"
echo "  ./diagnose-upload-issue.sh"
echo ""
echo "To stop:"
echo "  docker-compose down"