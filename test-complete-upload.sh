#!/bin/bash

echo "🚀 Complete Upload Test - Development vs Production"
echo "==============================================="

# Test 1: Upload in production mode
echo ""
echo "📋 Test 1: Upload API in Production Mode"
echo "🔄 Testing upload API..."

# Create test image
printf "\x89PNG\r\n\x1a\n\rIHDR\x01\x01\x08\x02\x90wS\xde\tpHYs\x0b\x13\x0b\x13\x01\x9a\x9c\x18\n\x1d\x8aIDATx\x9cc\xf8\x01\x01\x60\xe5\x27\xdeIEND\xaeB\x60\x82" > test-prod-upload.png

# Upload file
response=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-prod-upload.png" \
  -F "folder=test" \
  -w "HTTP_STATUS:%{http_code}")

# Extract response
http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
response_body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')

echo "📊 Response Status: $http_status"
echo "📋 Response Body: $response_body"

if [ "$http_status" = "200" ]; then
    echo "✅ Upload successful!"
    
    # Extract filename from response
    filename=$(echo "$response_body" | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
    file_url=$(echo "$response_body" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    
    echo "📄 Uploaded file: $filename"
    echo "🌐 File URL: $file_url"
    
    # Test 2: Verify file serving
    echo ""
    echo "📋 Test 2: File Serving in Production Mode"
    echo "🔄 Testing file serving..."
    
    serve_response=$(curl -s -I "http://localhost:3000$file_url" -w "HTTP_STATUS:%{http_code}")
    serve_status=$(echo "$serve_response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    content_length=$(echo "$serve_response" | grep -i "content-length:" | cut -d':' -f2 | tr -d ' \r')
    content_type=$(echo "$serve_response" | grep -i "content-type:" | cut -d':' -f2 | tr -d ' \r')
    
    echo "📊 Serve Status: $serve_status"
    echo "📦 Content Length: $content_length bytes"
    echo "📋 Content Type: $content_type"
    
    if [ "$serve_status" = "200" ] && [ "$content_length" = "59" ]; then
        echo "✅ File serving successful!"
        echo "✅ File size verified: 59 bytes"
        
        # Test 3: Download and verify content
        echo ""
        echo "📋 Test 3: Content Verification"
        downloaded_size=$(curl -s "http://localhost:3000$file_url" | wc -c)
        echo "📥 Downloaded size: $downloaded_size bytes"
        
        if [ "$downloaded_size" = "59" ]; then
            echo "✅ Content verification successful!"
        else
            echo "❌ Content verification failed - size mismatch"
        fi
    else
        echo "❌ File serving failed!"
        echo "Status: $serve_status, Size: $content_length"
    fi
else
    echo "❌ Upload failed!"
fi

# Clean up
rm -f test-prod-upload.png

echo ""
echo "🏁 Complete upload test finished"
echo "==============================================="