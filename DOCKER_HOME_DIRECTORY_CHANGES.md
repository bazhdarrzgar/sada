# Docker Home Directory Configuration Changes

## Overview
All Dockerfiles have been updated to use `/home/app` as the working directory instead of `/app` (root directory). This follows best practices for Docker security and file organization.

## Changes Made

### Modified Files
1. **Dockerfile** - Main production Dockerfile
2. **Dockerfile.dev** - Development Dockerfile
3. **Dockerfile.production** - Optimized production Dockerfile
4. **Dockerfile.simple** - Simple production Dockerfile
5. **Dockerfile.fixed** - Fixed production Dockerfile
6. **Dockerfile.improved** - Improved production Dockerfile

### Key Changes

#### 1. Working Directory
- **Before**: `WORKDIR /app`
- **After**: `WORKDIR /home/app`

All stages (deps, builder, runner) now use `/home/app` as the working directory.

#### 2. User Creation
Updated user creation commands to properly set home directory:

**Alpine-based images (Dockerfile.dev, Dockerfile.simple, Dockerfile.fixed, Dockerfile.improved):**
```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S -D -H -u 1001 -h /home/app -s /sbin/nologin -G nodejs nextjs
```

**Debian-based images (Dockerfile, Dockerfile.production):**
```dockerfile
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs --home /home/app nextjs
```

#### 3. File Paths
All COPY commands updated to reference `/home/app`:
- `COPY --from=deps /home/app/node_modules ./node_modules`
- `COPY --from=builder /home/app/public ./public`
- `COPY --from=builder /home/app/.next/standalone ./`
- `COPY --from=builder /home/app/.next/static ./.next/static`
- `COPY --from=builder /home/app/database ./database`
- `COPY --from=builder /home/app/scripts ./scripts`

#### 4. Permissions
Added proper ownership for the home directory:
```dockerfile
RUN chown -R nextjs:nodejs /home/app
```

## Benefits

1. **Security**: Non-root user with proper home directory
2. **Standards Compliance**: Follows Docker and Linux best practices
3. **Isolation**: Better separation from system directories
4. **Consistency**: All Dockerfiles now use the same directory structure
5. **Permissions**: Proper file ownership and access control

## Usage

All Dockerfiles can be used as before:

```bash
# Build with main Dockerfile
docker build -t sada-app .

# Build with specific Dockerfile
docker build -f Dockerfile.dev -t sada-app-dev .

# Build production version
docker build -f Dockerfile.production -t sada-app-prod .
```

## Testing

After building, verify the working directory:
```bash
docker run --rm sada-app pwd
# Should output: /home/app
```

Verify user:
```bash
docker run --rm sada-app whoami
# Should output: nextjs
```

## Notes

- All environment variables and configurations remain the same
- The application still runs on port 3000
- Health checks are unchanged
- Volume mounts should now reference `/home/app` if needed
- Database and upload directories are properly configured with permissions

## Compatibility

These changes are backward compatible for the application code, but if you have:
- Volume mounts referencing `/app`, update them to `/home/app`
- Scripts with hardcoded `/app` paths, update them accordingly
- docker-compose.yml files with path references, update them

## docker-compose.yml Updated

The `docker-compose.yml` file has been updated with the new paths:

**Production service (app):**
```yaml
volumes:
  - sqlite_data:/home/app/database
  - upload_data:/home/app/public/upload
```

**Development service (app-dev):**
```yaml
volumes:
  - .:/home/app
  - /home/app/node_modules
  - ./database:/home/app/database
  - ./public/upload:/home/app/public/upload
```

---
**Date Modified**: October 9, 2025
**Modified By**: E1 AI Agent
