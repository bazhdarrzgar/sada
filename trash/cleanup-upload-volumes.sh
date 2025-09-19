#!/bin/bash
echo "🧹 Cleaning up upload volumes..."
docker-compose down -v
docker volume rm sada_upload_data 2>/dev/null || echo "Volume already removed"
echo "✅ Upload volumes cleaned"
