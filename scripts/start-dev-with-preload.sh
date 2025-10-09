#!/bin/bash

echo "🚀 Starting Next.js development server with preloading..."

# Start Next.js dev server in background
NODE_OPTIONS='--max-old-space-size=512' next dev --hostname 0.0.0.0 --port 3000 &
NEXT_PID=$!

echo "⏳ Waiting for Next.js server to be ready..."

# Wait for the server to be ready
wait-on http://localhost:3000

echo "✅ Next.js server is ready! Starting page preloader..."

# Run the preloader
node scripts/preload.js

echo "🎉 Preloading complete! Next.js dev server is running with PID: $NEXT_PID"
echo "💡 To stop the server, run: kill $NEXT_PID"

# Keep the script running to maintain the dev server
wait $NEXT_PID