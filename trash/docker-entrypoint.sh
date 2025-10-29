#!/bin/bash

echo "🚀 Starting Sada application..."

# Ensure upload directories exist with proper permissions
echo "📁 Setting up upload directories..."
mkdir -p /app/public/upload/Image_Psl
mkdir -p /app/public/upload/Image_Activity  
mkdir -p /app/public/upload/driver_videos
mkdir -p /app/public/upload/license_images

# Set proper ownership and permissions
chown -R nextjs:nodejs /app/public/upload 2>/dev/null || echo "⚠️ Could not change ownership (might not be needed)"
chmod -R 755 /app/public/upload 2>/dev/null || echo "⚠️ Could not set permissions (might not be needed)"

echo "✅ Upload directories configured"

# Start the Next.js application
echo "🌟 Starting Next.js server..."

# Check if standalone server.js exists, otherwise use regular next start
if [ -f "/app/server.js" ]; then
    echo "📦 Using standalone server..."
    exec node server.js
elif [ -f "/app/.next/standalone/server.js" ]; then
    echo "📦 Using standalone server from .next..."
    exec node .next/standalone/server.js
else
    echo "🔧 Using Next.js start command..."
    exec npx next start --hostname 0.0.0.0 --port 3000
fi