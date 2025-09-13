# Docker Setup Solutions

## The Issue You're Experiencing

**Error Message:**
```
❌ Lockfile not found.
failed to solve: process "/bin/sh -c ..." did not complete successfully: exit code: 1
```

This error occurs during the Docker build process when it can't find the lockfiles (yarn.lock or package-lock.json) needed to install dependencies.

## 🚀 Quick Solutions (Try in Order)

### Solution 1: Use the Simple Setup Script (Recommended)
```bash
./simple-docker-setup.sh
```
This script handles the lockfile issue automatically and includes error checking.

### Solution 2: Use the Lockfile Fix Script
```bash
./fix-docker-lockfile.sh
```
This specifically addresses the lockfile problem and rebuilds cleanly.

### Solution 3: Manual Clean Build
```bash
# Stop containers and clean cache
docker-compose down -v
docker system prune -f

# Clean rebuild
docker-compose build --no-cache

# Start services
docker-compose up -d
```

### Solution 4: Regenerate Lockfiles
```bash
# Remove existing lockfiles
rm -f yarn.lock package-lock.json

# Reinstall (creates new lockfile)
yarn install

# Try Docker build again
docker-compose build --no-cache
```

## 🔍 Root Causes and Detailed Fixes

### Cause 1: Missing Lockfiles
**Problem:** The lockfiles don't exist or aren't being copied to Docker build context.

**Fix:**
```bash
# Check if lockfiles exist
ls -la | grep -E "(yarn.lock|package-lock.json)"

# If missing, create them:
yarn install  # Creates yarn.lock
# OR
npm install   # Creates package-lock.json
```

### Cause 2: .dockerignore Excluding Lockfiles
**Problem:** The .dockerignore file might be excluding lockfiles from the build context.

**Fix:**
```bash
# Check .dockerignore
cat .dockerignore | grep -E "(yarn.lock|package-lock.json)"

# If found, remove those lines or add exceptions:
echo "!yarn.lock" >> .dockerignore
echo "!package-lock.json" >> .dockerignore
```

### Cause 3: Docker Cache Issues
**Problem:** Cached layers are causing the build to fail.

**Fix:**
```bash
# Clean all Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# Or build image directly
docker build -t sada-app . --no-cache
```

### Cause 4: File Permissions
**Problem:** Docker can't read the lockfiles due to permission issues.

**Fix:**
```bash
# Fix file permissions
chmod 644 package.json yarn.lock package-lock.json

# Fix directory permissions
chmod 755 .

# Try build again
docker-compose build --no-cache
```

## 🛠️ Step-by-Step Troubleshooting

### Step 1: Verify Environment
```bash
# Check Docker installation
docker --version
docker-compose --version

# Check if you're in the right directory
ls -la | grep -E "(package.json|Dockerfile)"
```

### Step 2: Check Files
```bash
# Essential files that must exist:
ls -la package.json      # ✅ Must exist
ls -la yarn.lock         # ✅ Should exist
ls -la Dockerfile        # ✅ Must exist
ls -la docker-compose.yml # ✅ Must exist

# File contents check
head -5 package.json      # Should show valid JSON
head -5 yarn.lock        # Should show lockfile format
```

### Step 3: Test Build Context
```bash
# Create a minimal test Dockerfile
cat > Dockerfile.test << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
COPY yarn.lock* ./
COPY package-lock.json* ./
RUN ls -la
RUN pwd
EOF

# Test build
docker build -f Dockerfile.test -t test-build .

# Should show the copied files
```

### Step 4: Manual Verification
```bash
# Build with verbose output
docker build -t sada-app . --no-cache --progress=plain

# Check what files are actually copied
docker run --rm sada-app:latest ls -la /app/
```

## 🎯 Alternative Approaches

### Option 1: Local Development (Bypass Docker Issues)
```bash
# Skip Docker for now, run locally
yarn install
yarn dev:smart

# Application will be available at http://localhost:3000
```

### Option 2: Use Pre-built Image
```bash
# If available, use a pre-built image
docker pull sada-app:latest
docker-compose up -d
```

### Option 3: Different Docker Setup
```bash
# Use the fixed Dockerfile
cp Dockerfile.fixed Dockerfile

# Or modify docker-compose to use different build context
# Edit docker-compose.yml build section
```

## 🏆 Success Verification

After applying any fix, verify success:

```bash
# 1. Build should succeed without errors
docker-compose build

# 2. Services should start
docker-compose up -d

# 3. Check container status
docker-compose ps

# 4. Application should respond
curl http://localhost:3000

# 5. Upload functionality should work
./diagnose-upload-issue.sh
```

## 📞 Getting Help

If none of these solutions work:

1. **Collect Information:**
   ```bash
   # System info
   uname -a
   docker --version
   docker-compose --version
   
   # Project files
   ls -la | grep -E "(package|yarn|lock|Docker)"
   
   # Build output
   docker build -t test . --no-cache > build.log 2>&1
   ```

2. **Check Resources:**
   ```bash
   df -h    # Disk space
   free -h  # Memory
   ```

3. **Common Commands That Usually Work:**
   ```bash
   # The nuclear option (clean everything)
   docker system prune -a
   rm -rf node_modules yarn.lock package-lock.json
   yarn install
   docker-compose build --no-cache
   ```

## 📋 Quick Reference

| Issue | Command | Description |
|-------|---------|-------------|
| Lockfile missing | `yarn install` | Regenerate lockfile |
| Cache problems | `docker system prune -a` | Clear all cache |
| Permission issues | `chmod 644 *.json *.lock` | Fix file permissions |
| Build failures | `docker build . --no-cache` | Clean build |
| Complete reset | `./simple-docker-setup.sh` | Automated fix |

The most reliable approach is using `./simple-docker-setup.sh` which handles all these issues automatically.