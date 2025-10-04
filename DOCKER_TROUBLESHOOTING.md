# 🔧 Docker Troubleshooting Guide

This guide helps you solve common Docker deployment issues with Sada.

---

## 🚨 Build Errors

### Error: "No lockfile found"

**Symptoms:**
```
❌ No lockfile found
Available files:
total 12
-rw-r--r--    1 root     root          3645 Oct  4 14:27 package.json
```

**Cause:** The `yarn.lock` file is not being copied into the Docker build context.

**Solutions:**

1. **Verify yarn.lock exists:**
   ```bash
   ls -la yarn.lock
   ```

2. **Check .dockerignore doesn't exclude it:**
   ```bash
   grep -i "yarn.lock" .dockerignore
   # Should return nothing or be commented out
   ```

3. **Rebuild from the correct directory:**
   ```bash
   cd /path/to/sada
   docker-compose build --no-cache
   ```

4. **If yarn.lock is missing, generate it:**
   ```bash
   yarn install
   # This creates yarn.lock
   docker-compose build
   ```

---

### Error: "better-sqlite3 compilation failed"

**Symptoms:**
```
gyp ERR! build error
gyp ERR! stack Error: `make` failed with exit code: 2
```

**Cause:** Missing build tools in Docker image.

**Solutions:**

1. **Check Dockerfile has build dependencies:**
   ```dockerfile
   RUN apk add --no-cache \
       python3 \
       make \
       g++ \
       sqlite
   ```

2. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache app
   ```

3. **Check Alpine Linux version compatibility:**
   ```bash
   # In Dockerfile, use specific Node version
   FROM node:18-alpine
   ```

---

### Error: "COPY failed: file not found"

**Symptoms:**
```
COPY failed: file not found in build context or excluded by .dockerignore
```

**Solutions:**

1. **Check file exists in your directory:**
   ```bash
   ls -la | grep yarn.lock
   ```

2. **Verify you're building from correct directory:**
   ```bash
   pwd  # Should be in /app or your project root
   cd /path/to/sada
   docker-compose build
   ```

3. **Check .dockerignore:**
   ```bash
   cat .dockerignore | grep -v "^#"
   ```

---

## 🐳 Container Start Issues

### Error: "Port 3000 already in use"

**Symptoms:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

**Solutions:**

1. **Find what's using the port:**
   ```bash
   lsof -i :3000
   # or
   netstat -tlnp | grep 3000
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>
   ```

3. **Or change port in docker-compose.yml:**
   ```yaml
   services:
     app:
       ports:
         - "3001:3000"  # Use 3001 on host instead
   ```

---

### Error: "Container exits immediately"

**Symptoms:**
```
sada_app exited with code 1
```

**Solutions:**

1. **Check logs:**
   ```bash
   docker-compose logs app
   ```

2. **Check for common issues:**
   - Missing environment variables
   - Database connection issues
   - Port conflicts
   - Permission issues

3. **Try running in foreground:**
   ```bash
   docker-compose up app
   # See live output
   ```

4. **Inspect the container:**
   ```bash
   docker-compose ps
   docker inspect sada_app
   ```

---

### Error: "Health check failing"

**Symptoms:**
```
sada_app (unhealthy)
```

**Solutions:**

1. **Check health check logs:**
   ```bash
   docker inspect --format='{{json .State.Health}}' sada_app | jq
   ```

2. **Test endpoint manually:**
   ```bash
   docker-compose exec app wget -O- http://localhost:3000
   ```

3. **Increase startup time:**
   ```yaml
   # In docker-compose.yml
   healthcheck:
     start_period: 60s  # Increase from default
   ```

4. **Check application logs:**
   ```bash
   docker-compose logs -f app
   ```

---

## 💾 Database Issues

### Error: "Database file not found"

**Symptoms:**
```
Error: SQLITE_CANTOPEN: unable to open database file
```

**Solutions:**

1. **Check database directory permissions:**
   ```bash
   docker-compose exec app ls -la /app/database/
   ```

2. **Fix permissions:**
   ```bash
   docker-compose exec -u root app chown -R nextjs:nodejs /app/database
   docker-compose restart app
   ```

3. **Verify volume is mounted:**
   ```bash
   docker volume ls | grep sqlite
   docker volume inspect sada_sqlite_data
   ```

4. **Create directory if missing:**
   ```bash
   docker-compose exec app mkdir -p /app/database
   docker-compose exec app chown -R nextjs:nodejs /app/database
   ```

---

### Error: "Database is locked"

**Symptoms:**
```
Error: SQLITE_BUSY: database is locked
```

**Solutions:**

1. **Stop other containers accessing it:**
   ```bash
   docker-compose down
   docker-compose up -d app
   ```

2. **Check for WAL files:**
   ```bash
   docker-compose exec app ls -la /app/database/
   # Look for .db-shm and .db-wal files
   ```

3. **Restart container:**
   ```bash
   docker-compose restart app
   ```

---

## 🌐 Network Issues

### Error: "Cannot access application"

**Symptoms:**
- Browser shows "Can't connect"
- curl fails to connect

**Solutions:**

1. **Verify container is running:**
   ```bash
   docker-compose ps
   # Should show "Up" status
   ```

2. **Check port mapping:**
   ```bash
   docker-compose ps
   # Look for 0.0.0.0:3000->3000/tcp
   ```

3. **Test from inside container:**
   ```bash
   docker-compose exec app wget -O- http://localhost:3000
   ```

4. **Check firewall:**
   ```bash
   # Linux
   sudo ufw status
   sudo ufw allow 3000
   ```

5. **Try different browser/incognito:**
   - Clear cache
   - Try http://127.0.0.1:3000
   - Try http://localhost:3000

---

### Error: "API calls failing"

**Symptoms:**
- Frontend loads but data doesn't
- Console shows network errors

**Solutions:**

1. **Check backend logs:**
   ```bash
   docker-compose logs -f app
   ```

2. **Verify API endpoint:**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **Check CORS settings:**
   - Look in Next.js configuration
   - Check API route handlers

---

## 🔐 Permission Issues

### Error: "Permission denied"

**Symptoms:**
```
EACCES: permission denied, open '/app/database/sada.db'
```

**Solutions:**

1. **Fix file permissions:**
   ```bash
   docker-compose exec -u root app chown -R nextjs:nodejs /app/database
   docker-compose exec -u root app chown -R nextjs:nodejs /app/public/upload
   ```

2. **Check user in Dockerfile:**
   ```dockerfile
   USER nextjs  # Should be using non-root user
   ```

3. **Restart container:**
   ```bash
   docker-compose restart app
   ```

---

## 📦 Volume Issues

### Error: "Data not persisting"

**Symptoms:**
- Data disappears after container restart
- Database resets

**Solutions:**

1. **Check volumes are defined:**
   ```bash
   docker volume ls | grep sada
   ```

2. **Verify volume mounts in docker-compose.yml:**
   ```yaml
   volumes:
     - sqlite_data:/app/database
     - upload_data:/app/public/upload
   ```

3. **Don't use `docker-compose down -v`:**
   ```bash
   # This deletes volumes!
   docker-compose down -v  # ❌ DON'T

   # Use this instead
   docker-compose down     # ✅ DO
   ```

---

### Error: "Volume mount fails"

**Symptoms:**
```
Error response from daemon: error while mounting volume
```

**Solutions:**

1. **Remove and recreate volumes:**
   ```bash
   docker-compose down
   docker volume rm sada_sqlite_data sada_upload_data
   docker-compose up -d
   ```

2. **Check Docker daemon storage:**
   ```bash
   docker system df
   docker system prune  # If needed
   ```

---

## 🏗️ Build Performance Issues

### Issue: "Build is very slow"

**Solutions:**

1. **Use BuildKit:**
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose build
   ```

2. **Check .dockerignore:**
   ```bash
   cat .dockerignore
   # Should exclude node_modules, .git, etc.
   ```

3. **Layer caching:**
   - Don't modify package.json unnecessarily
   - Build order matters (dependencies first)

4. **Prune build cache:**
   ```bash
   docker builder prune
   ```

---

## 🔄 Update Issues

### Issue: "Changes not reflecting"

**Solutions:**

1. **Force rebuild:**
   ```bash
   docker-compose build --no-cache
   docker-compose up -d --force-recreate
   ```

2. **Check mounted volumes:**
   ```bash
   # In dev mode, code should be mounted
   docker-compose exec app-dev ls -la /app
   ```

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Linux/Windows)
   - Hard refresh: Cmd+Shift+R (Mac)

---

## 🧪 Development Mode Issues

### Error: "Hot reload not working"

**Solutions:**

1. **Check if using dev mode:**
   ```bash
   docker-compose --profile dev up -d app-dev
   ```

2. **Verify source mount:**
   ```yaml
   volumes:
     - .:/app
     - /app/node_modules  # Exclude node_modules
   ```

3. **Enable polling (for Docker on Windows/Mac):**
   ```yaml
   environment:
     - CHOKIDAR_USEPOLLING=true
     - WATCHPACK_POLLING=true
   ```

---

## 🛠️ Advanced Troubleshooting

### Complete Reset

When nothing else works:

```bash
# Stop everything
docker-compose down

# Remove volumes (⚠️ deletes data!)
docker volume rm sada_sqlite_data sada_upload_data

# Remove images
docker rmi $(docker images | grep sada | awk '{print $3}')

# Clean build cache
docker builder prune -a

# Start fresh
docker-compose build --no-cache
docker-compose up -d
```

---

### Debug Mode

Run container interactively:

```bash
# Stop current container
docker-compose stop app

# Run with shell
docker-compose run --rm app sh

# Inside container:
ls -la /app
cat /app/database/sada.db
node server.js  # Try running manually
```

---

### Check System Resources

```bash
# Disk space
df -h
docker system df

# Memory
free -h

# Containers
docker stats

# Clean up
docker system prune -a --volumes
```

---

## 📊 Diagnostic Commands

### Essential Checks

```bash
# 1. Container status
docker-compose ps

# 2. Logs
docker-compose logs -f app

# 3. Health
./docker-health-check.sh -v

# 4. Config
./docker-verify.sh

# 5. Quick status
./status.sh

# 6. Inspect container
docker inspect sada_app

# 7. Resource usage
docker stats sada_app

# 8. Network
docker network inspect sada_sada_network

# 9. Volumes
docker volume ls | grep sada
docker volume inspect sada_sqlite_data
```

---

## 🆘 Still Need Help?

If you're still stuck:

1. **Gather information:**
   ```bash
   # System info
   uname -a
   docker --version
   docker-compose --version
   
   # Container info
   docker-compose ps
   docker-compose logs app > app.log
   
   # Configuration
   cat docker-compose.yml > config.txt
   ```

2. **Check existing issues:**
   - GitHub: https://github.com/bazhdarrzgar/sada/issues

3. **Create new issue with:**
   - Operating system
   - Docker version
   - Error messages
   - Steps to reproduce
   - Logs from above commands

---

## ✅ Prevention Tips

1. **Always backup before major changes:**
   ```bash
   docker cp sada_app:/app/database/sada.db ./backup.db
   ```

2. **Use version control:**
   ```bash
   git commit -am "Before Docker changes"
   ```

3. **Test in dev mode first:**
   ```bash
   docker-compose --profile dev up -d app-dev
   ```

4. **Monitor logs regularly:**
   ```bash
   docker-compose logs -f app
   ```

5. **Keep Docker updated:**
   ```bash
   # Check for updates
   docker version
   # Update Docker Engine
   ```

---

**Need quick help? Run:**
```bash
./docker-health-check.sh -v
```
