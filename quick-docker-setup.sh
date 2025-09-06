#!/bin/bash

# Quick Docker Setup for SADA2
# Simple script for fast setup

set -e

echo "🚀 Starting SADA2 Docker Setup..."

# Check if package-lock.json exists, if not create it
if [ ! -f "package-lock.json" ] && [ ! -f "yarn.lock" ] && [ ! -f "pnpm-lock.yaml" ]; then
    echo "📦 Generating package-lock.json..."
    npm install
fi

# Stop local MongoDB if running
if systemctl is-active --quiet mongod 2>/dev/null; then
    echo "🛑 Stopping local MongoDB..."
    sudo systemctl stop mongod
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
# Check if user is in docker group, otherwise use sudo
if groups $USER | grep -q docker; then
    docker-compose up -d --build
else
    sudo docker-compose up -d --build
fi

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if application is running
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Setup completed successfully!"
    echo "🌐 Application is running at: http://localhost:3000"
else
    echo "⚠️  Containers are running but application may still be starting..."
    echo "🌐 Try accessing: http://localhost:3000"
fi

echo ""
echo "📋 Useful commands:"
# Check if user is in docker group to show appropriate commands
if groups $USER | grep -q docker; then
    echo "  View logs: docker-compose logs -f"
    echo "  Stop: docker-compose down"
    echo "  Status: docker-compose ps"
else
    echo "  View logs: sudo docker-compose logs -f"
    echo "  Stop: sudo docker-compose down"
    echo "  Status: sudo docker-compose ps"
fi
