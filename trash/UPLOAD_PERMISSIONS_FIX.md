# Upload Permissions Fix for Docker

This document explains how to fix the "Permission denied - unable to write file" error when uploading files in the Docker container.

## Problem

The error occurs because:
1. The Docker container runs as `nextjs` user (UID 1001, GID 1001)
2. The upload directories are owned by `root` (UID 0, GID 0)
3. The application doesn't have write permissions to create files

## Solutions

### Solution 1: Use the Fixed Setup Script (Recommended)

Run the comprehensive setup script that handles all permissions:

```bash
./docker-setup-with-permissions.sh
```

This script will:
- Stop existing containers
- Create proper directory structure
- Set correct ownership (1001:1001) for the nextjs user
- Build and start containers
- Show verification information

### Solution 2: Manual Permission Fix

If you prefer to fix permissions manually:

```bash
# Stop containers
docker-compose down

# Fix upload directory permissions
mkdir -p ./public/upload
sudo chown -R 1001:1001 ./public/upload
chmod -R 755 ./public/upload

# Start containers
docker-compose up -d
```

### Solution 3: Quick Permission Fix Script

Run the simple permission fix script:

```bash
./fix-upload-permissions.sh
```

## Verification

After applying the fix, verify the permissions:

```bash
# Check directory ownership and permissions
ls -la ./public/upload/

# Should show something like:
# drwxr-xr-x 9 1001 1001 4096 [date] .
```

## Docker Configuration Changes

The following files have been updated to handle permissions properly:

### 1. Updated Dockerfile
- Creates upload directory with proper ownership
- Sets correct permissions (755)
- Ensures nextjs user can write to upload directories

### 2. Updated docker-compose.yml
- Uses named volume instead of bind mount for better permission handling
- Proper volume configuration for upload persistence

### 3. Enhanced Upload API
- Better error handling and debugging
- Permission checks and reporting
- Automatic directory creation with proper permissions

## File Structure

After the fix, your upload directory structure should be:

```
./public/upload/
├── uploads/           # General uploads
├── images/            # Image uploads
├── videos/            # Video uploads
├── documents/         # Document uploads
├── Image_Activity/    # Activity images
├── Image_Psl/         # PSL images
├── docker_test_images/# Test images
├── driver_videos/     # Driver videos
├── license_images/    # License images
├── test/              # Test files
└── test_images/       # Test images
```

## Troubleshooting

### Issue: Still getting permission errors
**Solution**: Make sure you're using the correct UID/GID (1001:1001) for the nextjs user.

```bash
# Check the user in the container
docker-compose exec app id

# Should show: uid=1001(nextjs) gid=1001(nodejs)
```

### Issue: Container not starting
**Solution**: Check the logs and make sure all directories exist:

```bash
# Check container logs
docker-compose logs app

# Ensure directory exists
mkdir -p ./public/upload
```

### Issue: Volume mount problems
**Solution**: Use named volumes instead of bind mounts:

```yaml
volumes:
  - upload_data:/app/public/upload  # Named volume (recommended)
  # Instead of:
  # - ./public/upload:/app/public/upload  # Bind mount (can cause permission issues)
```

## Testing Upload Functionality

After fixing permissions, test the upload functionality:

1. Access the application at `http://localhost:3000`
2. Navigate to any page with file upload functionality
3. Try uploading an image or video file
4. The upload should complete successfully without permission errors

## File Size Limits

The application has the following file size limits:
- **Images**: 5MB maximum
- **Videos**: 50MB maximum

## Supported File Types

**Images**: jpeg, jpg, png, gif, webp, bmp, svg+xml
**Videos**: mp4, avi, mov, wmv, flv, webm, mkv

## Additional Notes

- The upload API automatically creates unique filenames using UUID
- Files are stored in `/app/public/upload/[folder]/` within the container
- Files are accessible via `/upload/[folder]/[filename]` URL path
- The system supports multiple upload folders for organization