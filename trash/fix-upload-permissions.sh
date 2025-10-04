#!/bin/bash

# Fix upload permissions script for Docker
# This script should be run before starting the Docker container

echo "🔧 Fixing upload directory permissions..."

# Create upload directory if it doesn't exist
mkdir -p ./public/upload

# Set proper ownership (1001:1001 is the nextjs user in the container)
sudo chown -R 1001:1001 ./public/upload

# Set proper permissions (755 allows read/write for owner, read for others)
chmod -R 755 ./public/upload

echo "✅ Upload directory permissions fixed!"
echo "📁 Directory: ./public/upload"
echo "👤 Owner: 1001:1001 (nextjs user)"
echo "🔒 Permissions: 755"

# List the directory to verify
ls -la ./public/upload/