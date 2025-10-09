#!/bin/bash
echo "🧪 Testing upload functionality..."

# Wait for application to be ready
echo "⏳ Waiting for application..."
max_attempts=30
attempt=1
while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost:3000 >/dev/null 2>&1; then
        echo "✅ Application is ready"
        break
    fi
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ Application not ready after $max_attempts attempts"
        exit 1
    fi
    echo "Attempt $attempt/$max_attempts..."
    sleep 2
    ((attempt++))
done

# Create test image
echo -e "\x89PNG\r\n\x1a\n\rIHDR\x01\x01\x08\x02\x90wS\xde\tpHYs\x0b\x13\x0b\x13\x01\x9a\x9c\x18\n\x1d\x8aIDATx\x9cc\xf8\x01\x01\`\xe5'\xdeIEND\xaeB\`\x82" > test-upload.png

# Test image upload
echo "📷 Testing image upload..."
image_result=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-upload.png" \
  -F "folder=test_images" \
  -w "HTTP_STATUS:%{http_code}")

image_status=$(echo "$image_result" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

# Create test video (small MP4)
echo -e "\x00\x00\x00\x20\x66\x74\x79\x70\x69\x73\x6F\x6D\x00\x00\x02\x00\x69\x73\x6F\x6D\x69\x73\x6F\x32\x61\x76\x63\x31\x6D\x70\x34\x31" > test-video.mp4

# Test video upload
echo "🎥 Testing video upload..."
video_result=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test-video.mp4" \
  -F "folder=test_videos" \
  -w "HTTP_STATUS:%{http_code}")

video_status=$(echo "$video_result" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)

# Clean up test files
rm -f test-upload.png test-video.mp4

# Report results
echo "📊 Upload Test Results:"
echo "- Image upload: $([ "$image_status" = "200" ] && echo "✅ Success" || echo "❌ Failed (Status: $image_status)")"
echo "- Video upload: $([ "$video_status" = "200" ] && echo "✅ Success" || echo "❌ Failed (Status: $video_status)")"

if [ "$image_status" = "200" ] && [ "$video_status" = "200" ]; then
    echo "🎉 All upload tests passed!"
    exit 0
else
    echo "❌ Some upload tests failed. Check the logs for details."
    if [ "$image_status" != "200" ]; then
        echo "Image upload response: $(echo "$image_result" | sed 's/HTTP_STATUS:[0-9]*$//')"
    fi
    if [ "$video_status" != "200" ]; then
        echo "Video upload response: $(echo "$video_result" | sed 's/HTTP_STATUS:[0-9]*$//')"
    fi
    exit 1
fi
