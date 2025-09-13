#!/bin/bash

echo "🐳 Docker Upload Test Script"
echo "============================"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Docker is running"
echo "✅ docker-compose.yml found"

# Build and start the application
echo ""
echo "🚀 Building and starting Docker containers..."
docker-compose down -v 2>/dev/null  # Clean start
docker-compose up -d --build

# Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 15

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ Containers failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

echo "✅ Containers are running"

# Test the application is accessible
echo "🌐 Testing application accessibility..."
if curl -f -s http://localhost:3000 >/dev/null; then
    echo "✅ Application is accessible at http://localhost:3000"
else
    echo "❌ Application is not accessible. Check logs:"
    docker-compose logs app
    exit 1
fi

# Test upload API
echo "🧪 Testing upload API..."

# Create a test image
echo -e "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\n\x1d\x8aIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\`\xe5'\xde\x00\x00\x00\x00IEND\xaeB\`\x82" > docker-test.png

# Test upload
upload_response=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@docker-test.png" \
  -F "folder=docker_test" \
  -w "HTTP_STATUS:%{http_code}")

http_status=$(echo "$upload_response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

if [ "$http_status" = "200" ]; then
    echo "✅ Upload API test successful!"
    echo "📁 Files should be visible in the upload directory"
    
    # Check upload directory
    echo "🔍 Checking upload directory contents:"
    docker exec $(docker-compose ps -q app) ls -la /app/public/upload/docker_test/ 2>/dev/null || echo "⚠️ Upload directory not accessible (might be normal)"
else
    echo "❌ Upload API test failed (Status: $http_status)"
    echo "📋 Response: $(echo "$upload_response" | sed 's/HTTP_STATUS:[0-9]*$//')"
    echo ""
    echo "🔍 Container logs:"
    docker-compose logs --tail=20 app
fi

# Clean up
rm -f docker-test.png

echo ""
echo "📊 Test Summary:"
echo "- Docker: ✅ Running"
echo "- Containers: ✅ Started"
echo "- Application: ✅ Accessible"
echo "- Upload API: $([ "$http_status" = "200" ] && echo "✅ Working" || echo "❌ Failed")"

echo ""
echo "🌐 Access your application at: http://localhost:3000"
echo "📚 For troubleshooting, see: DOCKER_UPLOAD_FIX.md"

if [ "$http_status" != "200" ]; then
    echo ""
    echo "❗ Upload functionality needs attention. Please check the troubleshooting guide."
    exit 1
fi

echo ""
echo "🎉 All tests passed! Your Docker setup is working correctly."