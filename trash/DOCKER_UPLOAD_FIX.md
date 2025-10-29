# Docker Upload Fix Guide

## Problem Summary
When running the Sada project in Docker, file uploads fail with "Failed to upload file" error due to permission issues between the Docker container user and the upload directory.

## Root Cause
- Docker container runs as `nextjs:nodejs` user (uid: 1001, gid: 1001)
- Upload directory may not have proper write permissions for this user
- Volume mount configurations can cause permission conflicts

## Solutions Implemented

### 1. Enhanced Upload API (`/app/api/upload/route.js`)
- ✅ Added comprehensive logging for debugging
- ✅ Enhanced error handling with specific Docker error messages
- ✅ Added file verification after write
- ✅ Permission handling for production/Docker environments

### 2. Improved Dockerfile
- ✅ Creates upload directories with proper permissions during build
- ✅ Sets correct ownership (`nextjs:nodejs`) for upload directories
- ✅ Added startup script for runtime permission fixes

### 3. Updated Docker Compose
- ✅ Uses named volume instead of bind mount for uploads
- ✅ Prevents host permission conflicts
- ✅ Ensures data persistence across container restarts

### 4. Docker Entrypoint Script
- ✅ Ensures upload directories exist on container startup
- ✅ Sets proper permissions at runtime
- ✅ Graceful fallback if permission changes fail

## Usage Instructions

### For Development (Local)
```bash
# Current setup works fine - no changes needed
yarn dev:preload-improved
```

### For Docker Production
```bash
# Build and start with Docker Compose
docker-compose up --build

# Or build manually
docker build -t sada-app .
docker run -p 3000:3000 -v sada_uploads:/app/public/upload sada-app
```

### For Docker Development
```bash
# Use development profile
docker-compose --profile dev up --build app-dev
```

## Troubleshooting

### If uploads still fail in Docker:

1. **Check container logs:**
   ```bash
   docker logs sada_app
   ```

2. **Inspect upload directory permissions:**
   ```bash
   docker exec sada_app ls -la /app/public/upload/
   ```

3. **Test upload API directly:**
   ```bash
   docker exec sada_app curl -X POST http://localhost:3000/api/upload \
     -F "file=@/app/test-upload.png" -F "folder=test"
   ```

4. **Reset upload volume:**
   ```bash
   docker-compose down -v
   docker volume rm sada_upload_data
   docker-compose up --build
   ```

### Common Error Messages and Solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `EACCES: permission denied` | Wrong directory permissions | Check Dockerfile sets ownership correctly |
| `ENOENT: no such file or directory` | Upload directory missing | Verify entrypoint script creates directories |
| `ENOSPC: no space left on device` | Disk full | Check Docker host disk space |

## File Structure After Fix
```
/app/public/upload/
├── Image_Psl/          # License images
├── Image_Activity/     # Activity images  
├── driver_videos/      # Video uploads
├── license_images/     # License uploads
└── test/              # Test uploads
```

## Testing Upload Functionality

1. **Access upload pages:**
   - http://localhost:3000/video-demo
   - http://localhost:3000/bus
   - http://localhost:3000/daily-accounts
   - http://localhost:3000/expenses

2. **Test with sample files:**
   - Images: PNG, JPG (max 5MB)
   - Videos: MP4, WebM (max 50MB)

3. **Check upload directory:**
   ```bash
   ls -la /app/public/upload/*/
   ```

## Environment Variables for Docker
Add these to your `.env` file for Docker environments:
```env
NODE_ENV=production
DOCKER_ENV=true
NEXT_TELEMETRY_DISABLED=1
```

The upload functionality should now work correctly in both local development and Docker environments!