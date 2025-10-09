# Docker Build Fix for better-sqlite3

## Problem
The `better-sqlite3` native module was causing build failures due to Node.js version mismatches between the development environment and Docker container.

## Solution Applied

### What Was Fixed

1. **Updated all Dockerfiles to Node.js 20**
   - All Docker images now use `node:20-slim` or `node:20-alpine`
   - Ensures consistent Node version across all stages

2. **Added node-gyp installation**
   - Globally installs node-gyp in both deps and builder stages
   - Required for native module compilation

3. **Force rebuild better-sqlite3 from source**
   - Completely removes prebuilt binaries
   - Reinstalls better-sqlite3@12.4.1 from source
   - Uses `--build-from-source` flag to ensure clean build

4. **Added verification step**
   - Tests better-sqlite3 loads correctly before building Next.js app
   - Fails fast if there's a problem

## How to Build

### Option 1: Using docker-compose (Recommended)

```bash
# Clean build (recommended for first time or after updates)
docker-compose build --no-cache
docker-compose up -d

# Check logs
docker-compose logs -f app

# Check health
docker-compose ps
```

### Option 2: Using Docker directly

```bash
# Build with main Dockerfile (Debian-based, most compatible)
docker build --no-cache -t sada-app .
docker run -d -p 3000:3000 --name sada sada-app

# Or build with simple Dockerfile (Alpine-based, smaller)
docker build --no-cache -f Dockerfile.simple -t sada-app .
docker run -d -p 3000:3000 --name sada sada-app
```

### Option 3: Using production Dockerfile

```bash
# Build with optimized production Dockerfile
docker build --no-cache -f Dockerfile.production -t sada-app .
docker run -d -p 3000:3000 --name sada sada-app
```

## Verification

### Check if build succeeded

```bash
# Check container is running
docker ps | grep sada

# Check logs for errors
docker logs sada

# Test the application
curl http://localhost:3000
```

### Verify better-sqlite3 inside container

```bash
# Enter container
docker exec -it sada sh

# Test better-sqlite3
node -e "const Database = require('better-sqlite3'); console.log('Works!');"

# Check Node version
node --version  # Should be v20.x.x
```

## Troubleshooting

### Build still fails with MODULE_VERSION error

```bash
# Ensure you're building with --no-cache
docker-compose build --no-cache

# Or for Docker
docker build --no-cache -t sada-app .
```

### better-sqlite3 not found

```bash
# Check if package.json has better-sqlite3
cat package.json | grep better-sqlite3

# Should show: "better-sqlite3": "^12.4.1"
```

### Container crashes on startup

```bash
# Check logs
docker logs sada

# Check if database directory exists
docker exec -it sada ls -la /app/database
```

### Slow build times

The build may take 5-10 minutes due to:
- Installing system dependencies
- Compiling better-sqlite3 from source
- Building Next.js production bundle

This is normal. Subsequent builds will be faster with Docker layer caching.

## Build Process Breakdown

1. **deps stage** (2-3 minutes)
   - Installs system dependencies (python3, make, g++, sqlite3)
   - Installs node-gyp
   - Installs all npm/yarn packages
   - better-sqlite3 gets built automatically

2. **builder stage** (5-7 minutes)
   - Copies node_modules from deps
   - Removes prebuilt better-sqlite3
   - Rebuilds better-sqlite3 from source for Node 20
   - Verifies better-sqlite3 works
   - Builds Next.js production bundle

3. **runner stage** (1 minute)
   - Creates minimal production image
   - Copies built application
   - Sets up user permissions
   - Configures healthcheck

**Total build time**: ~8-11 minutes (first build)
**Cached build time**: ~2-4 minutes (if only code changes)

## Files Modified

- ✅ `Dockerfile` - Main production Dockerfile (Debian-based)
- ✅ `Dockerfile.simple` - Simplified production Dockerfile (Alpine-based)
- ✅ `Dockerfile.production` - Optimized production Dockerfile
- ✅ `package.json` - Added engines field for Node 20
- ✅ `.nvmrc` - Node version specification
- ✅ `.node-version` - Node version for nodenv/n

## Best Practices

1. **Always use --no-cache for first build**
   ```bash
   docker-compose build --no-cache
   ```

2. **Check Docker version**
   ```bash
   docker --version  # Should be 20.0+ for best results
   ```

3. **Clean up old images**
   ```bash
   docker system prune -a
   ```

4. **Monitor build logs**
   ```bash
   docker-compose build --no-cache --progress=plain
   ```

## Production Deployment Checklist

- [ ] Built with --no-cache
- [ ] Container starts successfully
- [ ] Application accessible on port 3000
- [ ] Database initialized at /app/database/sada.db
- [ ] Upload directories have correct permissions
- [ ] Healthcheck passes
- [ ] No errors in docker logs
- [ ] better-sqlite3 loads without errors

## Support

If you continue to experience issues:

1. Share the complete build logs
2. Share your Docker version: `docker --version`
3. Share your OS: `uname -a`
4. Try the Dockerfile.production variant

## Additional Resources

- [Node.js 20 Documentation](https://nodejs.org/docs/latest-v20.x/api/)
- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
