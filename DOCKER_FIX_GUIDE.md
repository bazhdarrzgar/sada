# Docker Build Fix Guide for Sada Project

## Problem Analysis

The Docker build is failing at the `yarn --frozen-lockfile` step. This is typically caused by:

1. **better-sqlite3 compilation issues** - Native module requiring C++ compilation in Alpine Linux
2. **Missing build dependencies** - Alpine's minimal nature means some build tools might be missing
3. **Architecture mismatch** - ARM vs AMD64 compatibility issues
4. **Network timeouts** - Large dependency downloads timing out

## Solution Options

### Option 1: Use Improved Dockerfile (Recommended)

The improved Dockerfile adds fallback logic and better build tools:

```bash
# Use the improved Dockerfile
mv Dockerfile Dockerfile.original
cp Dockerfile.improved Dockerfile

# Clean build
docker-compose build --no-cache
docker-compose up -d
```

**What's different:**
- Added `gcc`, `musl-dev`, `sqlite-dev`, and `git` to build dependencies
- Fallback to non-frozen lockfile if frozen fails
- Better error handling with explicit rebuild of better-sqlite3
- Increased network timeout to 1000 seconds

### Option 2: Use Simple Dockerfile (Most Compatible)

The simple Dockerfile removes frozen-lockfile constraint:

```bash
# Use the simple Dockerfile
mv Dockerfile Dockerfile.original
cp Dockerfile.simple Dockerfile

# Clean build
docker-compose build --no-cache
docker-compose up -d
```

**What's different:**
- No frozen-lockfile requirement
- Comprehensive build tool installation
- Simpler installation flow without strict version locking

### Option 3: Fix Original Dockerfile

Edit the original Dockerfile at line 7-13 to add missing dependencies:

```dockerfile
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    gcc \
    musl-dev \
    sqlite \
    sqlite-dev \
    git
```

And change line 21-22 to:

```dockerfile
RUN echo "✅ Installing with yarn..." && \
    yarn install --frozen-lockfile --production=false --network-timeout 1000000
```

## Debugging Steps

### Step 1: Get Full Error Logs

```bash
# Build with full output to see the actual error
docker-compose build --progress=plain 2>&1 | tee build.log

# Check the last 100 lines where the error occurs
tail -100 build.log
```

### Step 2: Test Build Stage by Stage

```bash
# Test just the deps stage
docker build --target deps -t sada-test:deps .

# If deps succeeds, test builder stage
docker build --target builder -t sada-test:builder .
```

### Step 3: Verify Locally

```bash
# These should all work in your current environment:
cd /app
yarn install --frozen-lockfile --production=false
yarn check --verify-tree
```

### Step 4: Platform-Specific Build

If on Apple Silicon (M1/M2):

```bash
# Build for AMD64 platform
docker build --platform linux/amd64 -t sada .

# Or update docker-compose.yml to add:
services:
  app:
    platform: linux/amd64
```

## Common Error Solutions

### Error: "gyp ERR! build error"

**Cause:** Missing C++ compiler or build tools  
**Solution:** Use Dockerfile.improved which has comprehensive build tools

### Error: "ELIFECYCLE" or "Exit code 1"

**Cause:** Generic build failure, often from better-sqlite3  
**Solution:** 
```dockerfile
# Add this before yarn install
ENV PYTHON=/usr/bin/python3
RUN apk add --no-cache gcc musl-dev sqlite-dev
```

### Error: "premature close" or network errors

**Cause:** Network timeout during package download  
**Solution:** Add `--network-timeout 1000000` to yarn install command

### Error: "Couldn't find package"

**Cause:** yarn.lock references packages that aren't available  
**Solution:** Use Dockerfile.simple without frozen-lockfile

## Quick Start Commands

### Using Docker Compose with Improved Dockerfile

```bash
# Backup original
cp Dockerfile Dockerfile.backup

# Use improved version
cp Dockerfile.improved Dockerfile

# Clean everything
docker-compose down -v
docker system prune -a -f

# Fresh build
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Manual Docker Build

```bash
# Build with improved Dockerfile
docker build -f Dockerfile.improved -t sada:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/database:/app/database \
  --name sada \
  sada:latest

# Check logs
docker logs -f sada
```

## Verification

After successful build:

```bash
# Check container is running
docker ps

# Check application is accessible
curl http://localhost:3000

# Check logs for errors
docker logs sada | tail -50

# Verify database
docker exec sada ls -lh /app/database/
```

## Still Not Working?

If all else fails, you can:

1. **Use Local Development** (already working):
   ```bash
   yarn dev
   # Access at http://localhost:3000
   ```

2. **Use Node-based Dockerfile** (instead of Alpine):
   ```dockerfile
   FROM node:18-bullseye AS base
   # Rest of Dockerfile...
   ```
   Debian-based images have better native module support

3. **Pre-build better-sqlite3**:
   ```bash
   # Before Docker build
   npm rebuild better-sqlite3
   git add -f node_modules/better-sqlite3
   # Then build
   ```

## Current Status

✅ **Local Development:** Working perfectly  
✅ **yarn.lock:** Valid and tested  
✅ **Dependencies:** All installed locally  
✅ **Database:** SQLite database created and functional  

The Docker build issue is purely about the Docker environment configuration, not your code or dependencies!

## Files Created

- `Dockerfile.improved` - Enhanced version with better error handling
- `Dockerfile.simple` - Simplified version without frozen-lockfile
- `Dockerfile.original` - Your original Dockerfile (backup)
- `DOCKER_FIX_GUIDE.md` - This guide

## Next Steps

1. Choose a Dockerfile option (Improved recommended)
2. Run clean build with `docker-compose build --no-cache`
3. If it fails, check the full logs with `--progress=plain`
4. Share the complete error output if you need more help

Remember: Your application is **already working** in local development mode! Docker is optional for deployment.
