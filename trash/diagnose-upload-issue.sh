#!/bin/bash

# Upload Issue Diagnosis Script
# Run this script to identify upload permission problems

echo "🔍 Diagnosing upload permission issues..."
echo "======================================"

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "🐳 Running inside Docker container"
    CONTAINER_ENV=true
else
    echo "💻 Running on host system"
    CONTAINER_ENV=false
fi

echo ""
echo "📂 Upload Directory Analysis:"
echo "----------------------------"

# Check if upload directory exists
if [ -d "./public/upload" ]; then
    echo "✅ Upload directory exists: ./public/upload"
    
    # Show directory permissions
    echo "📊 Directory permissions:"
    ls -la ./public/upload/
    
    echo ""
    echo "📋 Detailed directory info:"
    stat ./public/upload/ 2>/dev/null || echo "❌ Could not get detailed directory info"
    
else
    echo "❌ Upload directory does not exist: ./public/upload"
    echo "🔧 Creating upload directory..."
    mkdir -p ./public/upload
    echo "✅ Upload directory created"
fi

echo ""
echo "👤 User Information:"
echo "-------------------"
echo "Current user: $(whoami)"
echo "Current UID: $(id -u)"
echo "Current GID: $(id -g)"
echo "User groups: $(groups)"

if [ "$CONTAINER_ENV" = true ]; then
    echo ""
    echo "🐳 Docker Container Specific Checks:"
    echo "-----------------------------------"
    
    # Check if nextjs user exists
    if id -u nextjs >/dev/null 2>&1; then
        echo "✅ nextjs user exists"
        echo "nextjs UID: $(id -u nextjs)"
        echo "nextjs GID: $(id -g nextjs)"
    else
        echo "❌ nextjs user does not exist"
    fi
    
    # Check Node.js process owner
    if pgrep -f "node" >/dev/null; then
        echo "📊 Node.js processes:"
        ps aux | grep node | grep -v grep
    else
        echo "❌ No Node.js processes running"
    fi
fi

echo ""
echo "🧪 Write Permission Test:"
echo "------------------------"

# Test write permissions
TEST_FILE="./public/upload/permission_test_$(date +%s).txt"
echo "Testing write to: $TEST_FILE"

if echo "Permission test" > "$TEST_FILE" 2>/dev/null; then
    echo "✅ Write test successful"
    rm "$TEST_FILE" 2>/dev/null
    echo "✅ File cleanup successful"
else
    echo "❌ Write test failed - Permission denied"
    echo "💡 This confirms the permission issue"
fi

echo ""
echo "🔧 Recommended Fixes:"
echo "--------------------"

if [ "$CONTAINER_ENV" = true ]; then
    echo "1. Exit container and run on host:"
    echo "   docker-compose down"
    echo "   sudo chown -R 1001:1001 ./public/upload"
    echo "   chmod -R 755 ./public/upload"
    echo "   docker-compose up -d"
    echo ""
    echo "2. Or use the automated script:"
    echo "   ./docker-setup-with-permissions.sh"
else
    echo "1. Fix permissions for Docker (1001:1001 is nextjs user):"
    echo "   sudo chown -R 1001:1001 ./public/upload"
    echo "   chmod -R 755 ./public/upload"
    echo ""
    echo "2. Or use the permission fix script:"
    echo "   ./fix-upload-permissions.sh"
    echo ""
    echo "3. Or use the comprehensive setup script:"
    echo "   ./docker-setup-with-permissions.sh"
fi

echo ""
echo "📚 For more information, see: UPLOAD_PERMISSIONS_FIX.md"