# 🐳 Docker Quick Reference for Sada

Quick command reference for Docker deployment of Sada School Management System.

## 🚀 Quick Start Commands

### Start Application
```bash
# Interactive start (recommended for beginners)
./docker-start.sh

# Production mode
docker-compose up -d app

# Development mode (with hot reload)
docker-compose --profile dev up -d app-dev
```

### Check Status
```bash
# View running containers
docker-compose ps

# Health check
./docker-health-check.sh

# Detailed health check with logs
./docker-health-check.sh -v

# Verify configuration
./docker-verify.sh
```

### View Logs
```bash
# Production logs
docker-compose logs -f app

# Development logs
docker-compose logs -f app-dev

# Last 100 lines
docker-compose logs --tail=100 app

# Follow all service logs
docker-compose logs -f
```

### Stop Application
```bash
# Stop containers (data is preserved)
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

## 🔧 Management Commands

### Restart Services
```bash
# Restart production app
docker-compose restart app

# Restart development app
docker-compose restart app-dev

# Restart all services
docker-compose restart
```

### Rebuild and Update
```bash
# Rebuild from scratch
docker-compose build --no-cache app

# Rebuild and start
docker-compose up -d --build app

# Pull latest base images and rebuild
docker-compose pull
docker-compose up -d --build
```

### Access Container Shell
```bash
# Production container
docker-compose exec app sh

# Development container
docker-compose exec app-dev sh

# As root user
docker-compose exec -u root app sh
```

## 💾 Backup & Restore

### Database Backup
```bash
# Create backup
docker cp sada_app:/app/database/sada.db ./backup-$(date +%Y%m%d-%H%M%S).db

# Restore backup
docker cp ./backup.db sada_app:/app/database/sada.db
docker-compose restart app

# Backup from running container to host
docker-compose exec app sqlite3 /app/database/sada.db ".backup '/tmp/backup.db'"
docker cp sada_app:/tmp/backup.db ./
```

### Files Backup
```bash
# Backup uploads directory
docker cp sada_app:/app/public/upload ./uploads-backup-$(date +%Y%m%d)

# Restore uploads
docker cp ./uploads-backup sada_app:/app/public/upload
```

### Complete Backup
```bash
# Backup everything
mkdir -p ./full-backup-$(date +%Y%m%d)
docker cp sada_app:/app/database ./full-backup-$(date +%Y%m%d)/
docker cp sada_app:/app/public/upload ./full-backup-$(date +%Y%m%d)/
```

## 📊 Monitoring & Debugging

### Resource Usage
```bash
# View resource usage
docker stats sada_app

# View all containers
docker stats

# One-time stats
docker stats --no-stream sada_app
```

### Inspect Container
```bash
# View container details
docker inspect sada_app

# View container IP
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' sada_app

# View environment variables
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' sada_app
```

### Debug Issues
```bash
# View last 50 log lines
docker-compose logs --tail=50 app

# View error logs only
docker-compose logs app 2>&1 | grep -i error

# Check container health
docker inspect --format='{{.State.Health.Status}}' sada_app

# View health check logs
docker inspect --format='{{json .State.Health}}' sada_app | jq
```

## 🗑️ Cleanup

### Remove Old Containers
```bash
# Remove stopped containers
docker-compose rm

# Remove all stopped containers
docker container prune
```

### Remove Old Images
```bash
# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

### Clean Volumes
```bash
# List volumes
docker volume ls

# Remove specific volume
docker volume rm sada_sqlite_data

# Remove all unused volumes (⚠️ careful!)
docker volume prune
```

### Complete Cleanup
```bash
# Remove everything (⚠️ very careful!)
docker-compose down -v --rmi all --remove-orphans
docker system prune -a --volumes
```

## 🌐 Port Mapping

| Service | Container Port | Host Port | URL |
|---------|----------------|-----------|-----|
| Production App | 3000 | 3000 | http://localhost:3000 |
| Development App | 3000 | 3001 | http://localhost:3001 |

## 📁 Volume Locations

| Volume Name | Container Path | Purpose |
|-------------|----------------|---------|
| sqlite_data | /app/database | SQLite database files |
| upload_data | /app/public/upload | User uploaded files |

## 🔐 Default Credentials

- **Username:** berdoz
- **Password:** berdoz@code

⚠️ **Change these immediately in production!**

## 🆘 Troubleshooting Commands

### Container Won't Start
```bash
# Check logs for errors
docker-compose logs app

# Check if port is in use
lsof -i :3000

# Rebuild completely
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Issues
```bash
# Check database file
docker-compose exec app ls -lh /app/database/

# Check database integrity
docker-compose exec app sqlite3 /app/database/sada.db "PRAGMA integrity_check;"

# Optimize database
docker-compose exec app sqlite3 /app/database/sada.db "PRAGMA optimize; VACUUM;"
```

### Permission Issues
```bash
# Fix database permissions
docker-compose exec -u root app chown -R nextjs:nodejs /app/database

# Fix upload permissions
docker-compose exec -u root app chown -R nextjs:nodejs /app/public/upload
```

### Network Issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d

# Check network
docker network ls
docker network inspect sada_sada_network
```

## 📝 Useful Docker Compose Flags

```bash
# Run in foreground (see logs)
docker-compose up

# Run in background
docker-compose up -d

# Force recreate containers
docker-compose up -d --force-recreate

# Pull latest images
docker-compose pull

# Build without cache
docker-compose build --no-cache

# View configuration
docker-compose config
```

## 🔗 Related Files

- `Dockerfile` - Production image configuration
- `Dockerfile.dev` - Development image configuration  
- `docker-compose.yml` - Service orchestration
- `.dockerignore` - Files to exclude from build
- `DOCKER_DEPLOYMENT.md` - Complete deployment guide
- `.env.example` - Environment variable template

## 📞 Need Help?

1. Run verification: `./docker-verify.sh`
2. Run health check: `./docker-health-check.sh -v`
3. Check logs: `docker-compose logs -f`
4. Read full guide: `DOCKER_DEPLOYMENT.md`
5. GitHub: https://github.com/bazhdarrzgar/sada

---

**💡 Tip:** Bookmark this file for quick access to common commands!
