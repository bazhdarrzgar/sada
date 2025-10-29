#!/bin/bash

echo "🚀 Starting Next.js development server with improved preloading..."

# Start Next.js dev server in background with more memory
NODE_OPTIONS='--max-old-space-size=1024' next dev --hostname 0.0.0.0 --port 3000 &
NEXT_PID=$!

echo "⏳ Waiting for Next.js server to be ready..."

# Wait for the server to be ready
wait-on http://localhost:3000

echo "✅ Next.js server is ready! Starting intelligent preloader..."

# Run the improved preloader
node scripts/improved-preload.js

echo "🎉 Preloading complete! Next.js dev server is running with PID: $NEXT_PID"
echo "💡 To stop the server, run: kill $NEXT_PID"
echo "🌐 Access your app at: http://localhost:3000"

# Keep the script running to maintain the dev server
wait $NEXT_PID