# Docker Build Fix Guide

## Issue: "Lockfile not found" Error

### Problem
Getting this error when running `./docker-setup-with-permissions.sh`:
```
❌ Lockfile not found.
failed to solve: process "/bin/sh -c ..." did not complete successfully: exit code: 1
```

### Root Cause
The Docker build process cannot find the lockfiles (yarn.lock, package-lock.json) in the build context.

## Solutions

### Solution 1: Clean Build (Recommended)
```bash
# Stop all containers
docker-compose down -v

# Clean Docker cache
docker system prune -f

# Remove any build cache
docker builder prune -f

# Rebuild with no cache
docker-compose build --no-cache

# Start services
docker-compose up -d
```

### Solution 2: Verify Build Context
```bash
# Check if lockfiles exist in project root
ls -la | grep -E "(yarn.lock|package-lock.json)"

# Should show:
# -rw-r--r-- 1 user user 124624 date yarn.lock
# -rw-r--r-- 1 user user 115000 date package-lock.json

# If files are missing, regenerate them:
yarn install  # This creates yarn.lock
# OR
npm install   # This creates package-lock.json
```

### Solution 3: Manual Docker Build
```bash
# Build the image manually to see detailed output
docker build -t sada-app . --no-cache

# Check what files are copied
docker run --rm sada-app ls -la

# If successful, start with docker-compose
docker-compose up -d
```

### Solution 4: Alternative Setup Method
If Docker build continues to fail, use local development:

```bash
# Install dependencies locally
yarn install

# Start development server
yarn dev:smart

# Application will be available at http://localhost:3000
```

## Debugging Steps

### Step 1: Verify Docker Installation
```bash
docker --version
docker-compose --version

# Should show version numbers, not "command not found"
```

### Step 2: Check Project Files
```bash
# Essential files that must exist:
ls -la package.json      # ✅ Must exist
ls -la yarn.lock        # ✅ Should exist  
ls -la Dockerfile       # ✅ Must exist
ls -la docker-compose.yml # ✅ Must exist

# Check .dockerignore doesn't exclude lockfiles
cat .dockerignore | grep -E "(yarn.lock|package-lock.json)"
# Should NOT show these files (they shouldn't be ignored)
```

### Step 3: Test Build Context
```bash
# Create a test Dockerfile to see what gets copied
cat > Dockerfile.test << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN ls -la
EOF

# Build test image
docker build -f Dockerfile.test -t test-context .

# Check output for lockfiles
```

### Step 4: Clean Workspace
```bash
# Remove node_modules and lockfiles
rm -rf node_modules
rm -f yarn.lock package-lock.json

# Reinstall with preferred package manager
yarn install  # Creates yarn.lock
# OR
npm install   # Creates package-lock.json

# Try Docker build again
docker-compose build --no-cache
```

## Common Issues and Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| `docker: command not found` | Docker not installed | Install Docker and Docker Compose |
| `permission denied` | Docker permissions | Add user to docker group: `sudo usermod -aG docker $USER` |
| `no space left on device` | Disk full | Clean up: `docker system prune -a` |
| `lockfile not found` | Build context issue | Check .dockerignore, rebuild with --no-cache |
| `network timeout` | Internet connectivity | Check network, retry build |

## Verification

After fixing, verify the setup works:

```bash
# 1. Build should succeed
docker-compose build

# 2. Services should start
docker-compose up -d

# 3. Application should respond
curl http://localhost:3000

# 4. Upload should work
./diagnose-upload-issue.sh
```

## Alternative: Using Dockerfile.fixed

If the main Dockerfile continues to have issues, try the fixed version:

```bash
# Use the pre-configured fixed Dockerfile
cp Dockerfile.fixed Dockerfile

# Build with the fixed version
docker-compose build --no-cache

# Start services
docker-compose up -d
```

## Getting Help

If issues persist:

1. **Collect logs**:
   ```bash
   docker-compose build --no-cache > build.log 2>&1
   ```

2. **Check system resources**:
   ```bash
   df -h          # Disk space
   free -h        # Memory
   docker info    # Docker status
   ```

3. **Share diagnostic info**:
   - Operating system and version
   - Docker and Docker Compose versions
   - Build logs
   - Output of `ls -la` in project directory

The most common fix is using `docker-compose build --no-cache` to ensure a clean build without cached layers.