#!/bin/bash

# Docker Build Script for Sada Project
# Make sure Docker is installed and running before executing this script

set -e

echo "🐳 Building Sada Project with Docker..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Build the application
echo "🔨 Building Docker images..."
docker-compose build

# Start the services
echo "🚀 Starting services..."
docker-compose up -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "📊 Checking service status..."
docker-compose ps

# Check if application is responding
echo "🌐 Testing application endpoint..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🔗 Access your application at: http://localhost:3000"
else
    echo "⚠️  Application may still be starting up..."
    echo "🔍 Check logs with: docker-compose logs -f"
fi

echo ""
echo "🎉 Docker setup complete!"
echo ""
echo "📋 Useful commands:"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose down            # Stop services"
echo "  docker-compose restart app     # Restart app"
echo "  docker-compose --profile dev up -d # Development mode"
echo ""