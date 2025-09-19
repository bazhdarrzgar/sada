#!/bin/bash

echo "🧪 Testing upload API..."

# Create a small test image
echo "📷 Creating test image..."
printf "\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\n\x1d\x8aIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x60\xe5\x27\xde\x00\x00\x00\x00IEND\xaeB\x60\x82" > test-upload.png

# Test the upload API
echo "🔄 Testing upload API..."
response=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-upload.png" \
  -F "folder=test" \
  -w "HTTP_STATUS:%{http_code}")

# Extract response body and status code
http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "📊 Response Status: $http_status"
echo "📋 Response Body: $response_body"

# Check if upload was successful
if [ "$http_status" = "200" ]; then
    echo "✅ Upload API test successful!"
else
    echo "❌ Upload API test failed!"
fi

# Clean up
rm -f test-upload.png

echo "🏁 Upload API test completed"