#!/bin/bash

# Quick fix for Docker "lockfile not found" error
# Run this if you get the lockfile error during Docker build

echo "🔧 Fixing Docker lockfile issue..."

# Check current directory
if [ ! -f "package.json" ]; then
    echo "❌ Run this script from the project root directory (where package.json is located)"
    exit 1
fi

# Clean up existing build artifacts
echo "🧹 Cleaning up..."
docker-compose down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Check lockfiles
echo "📋 Checking lockfiles..."
if [ -f "yarn.lock" ]; then
    echo "✅ yarn.lock exists"
elif [ -f "package-lock.json" ]; then
    echo "✅ package-lock.json exists"
else
    echo "⚠️  No lockfile found. Creating one..."
    
    # Try yarn first, then npm
    if command -v yarn &> /dev/null; then
        echo "📦 Installing with yarn..."
        yarn install
    elif command -v npm &> /dev/null; then
        echo "📦 Installing with npm..."
        npm install
    else
        echo "❌ Neither yarn nor npm found!"
        exit 1
    fi
fi

# Verify files exist
echo "✅ Verifying essential files:"
ls -la package.json
ls -la yarn.lock 2>/dev/null || ls -la package-lock.json 2>/dev/null || echo "⚠️  No lockfile visible"
ls -la Dockerfile

# Check .dockerignore
if [ -f ".dockerignore" ]; then
    echo "📄 Checking .dockerignore..."
    if grep -E "(yarn\.lock|package-lock\.json)" .dockerignore; then
        echo "⚠️  Lockfiles are excluded in .dockerignore! This might be the issue."
        echo "Creating backup and fixing..."
        cp .dockerignore .dockerignore.backup
        sed -i '/yarn\.lock/d; /package-lock\.json/d' .dockerignore
        echo "✅ Fixed .dockerignore"
    else
        echo "✅ .dockerignore looks good"
    fi
fi

# Try building
echo "🔨 Attempting Docker build..."
if docker build -t sada-test . --no-cache; then
    echo "✅ Build successful!"
    echo "Now you can run: docker-compose up -d"
else
    echo "❌ Build still failing. Additional troubleshooting:"
    echo ""
    echo "1. Files in current directory:"
    ls -la | grep -E "(package|yarn|lock|Docker)"
    echo ""
    echo "2. Try this alternative approach:"
    echo "   # Remove lockfiles and regenerate"
    echo "   rm -f yarn.lock package-lock.json"
    echo "   yarn install"
    echo "   docker build -t sada-test . --no-cache"
    echo ""
    echo "3. Check detailed guide: DOCKER_BUILD_FIX.md"
fi