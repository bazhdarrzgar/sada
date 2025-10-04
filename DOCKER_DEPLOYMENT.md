# 🐳 Docker Deployment Guide for Sada

This guide explains how to deploy the Sada School Management System using Docker with SQLite database.

## 📋 Prerequisites

- **Docker** 20.10 or higher
- **Docker Compose** 2.0 or higher
- At least **2GB RAM** available
- At least **1GB disk space** available

## 🚀 Quick Start

### Production Deployment

1. **Build and start the application:**
   ```bash
   docker-compose up -d app
   ```

2. **Access the application:**
   - URL: http://localhost:3000
   - Default Login: `berdoz` / `berdoz@code`

3. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Development Deployment (with hot reload)

1. **Start development environment:**
   ```bash
   docker-compose --profile dev up -d app-dev
   ```

2. **Access the application:**
   - URL: http://localhost:3001
   - Changes to code will automatically reload

3. **View logs:**
   ```bash
   docker-compose logs -f app-dev
   ```

## 🏗️ Architecture

### Dockerfiles

1. **Dockerfile** (Production)
   - Multi-stage build for optimized image size
   - Includes SQLite and better-sqlite3 compilation tools
   - Non-root user for security
   - Health checks enabled
   - Standalone Next.js output

2. **Dockerfile.dev** (Development)
   - Single-stage build for faster iteration
   - Hot reload enabled
   - Development tools included
   - Volume mounting for live code changes

### Key Features

- ✅ **SQLite Database** with persistent volume
- ✅ **File Upload Support** with persistent storage
- ✅ **Better-sqlite3** native compilation
- ✅ **Health Checks** for container monitoring
- ✅ **Security** (non-root user, minimal attack surface)
- ✅ **Hot Reload** in development mode

## 📊 Volume Management

### Persistent Volumes

1. **sqlite_data** - SQLite database files
   - Location: `/app/database` inside container
   - Contains: `sada.db`, `sada.db-shm`, `sada.db-wal`

2. **upload_data** - User uploaded files
   - Location: `/app/public/upload` inside container
   - Subdirectories: uploads, images, videos, documents

### Backup Database

```bash
# Copy database from container
docker cp sada_app:/app/database/sada.db ./backup-$(date +%Y%m%d).db

# Restore database to container
docker cp ./backup.db sada_app:/app/database/sada.db
docker-compose restart app
```

### Backup Uploads

```bash
# Backup uploads directory
docker cp sada_app:/app/public/upload ./uploads-backup-$(date +%Y%m%d)

# Restore uploads
docker cp ./uploads-backup sada_app:/app/public/upload
```

## 🔧 Configuration

### Environment Variables

You can customize the deployment by creating a `.env` file:

```env
# Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Next.js
NEXT_TELEMETRY_DISABLED=1

# Development (for app-dev only)
CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true
```

### Port Configuration

Change the exposed port in `docker-compose.yml`:

```yaml
ports:
  - "8080:3000"  # Maps container port 3000 to host port 8080
```

## 🛠️ Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check if port is already in use
lsof -i :3000

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache app
docker-compose up -d app
```

### Database permission issues

```bash
# Fix permissions (run from host)
docker-compose exec app chown -R nextjs:nodejs /app/database
```

### Better-sqlite3 compilation issues

If you see errors about better-sqlite3:

```bash
# Rebuild with verbose output
docker-compose build --no-cache --progress=plain app
```

### Health check failing

```bash
# Check if app is responding
docker-compose exec app wget -O- http://localhost:3000

# Increase startup time in docker-compose.yml
healthcheck:
  start_period: 60s  # Increase from 40s
```

## 📈 Performance Optimization

### Production Optimization

1. **Memory limit:**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

2. **CPU limit:**
   ```yaml
   services:
     app:
       deploy:
         resources:
           limits:
             cpus: '0.5'
   ```

### Database Optimization

SQLite is configured in WAL mode for better concurrent access. To optimize further:

```bash
# Access SQLite in container
docker-compose exec app sqlite3 /app/database/sada.db

# Run optimization commands
PRAGMA optimize;
VACUUM;
```

## 🔒 Security Best Practices

1. **Change default credentials** immediately after deployment
2. **Use secrets** for sensitive data (not environment variables)
3. **Regular backups** of database and uploads
4. **Update base images** regularly:
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```
5. **Scan for vulnerabilities:**
   ```bash
   docker scan sada_app
   ```

## 🌐 Production Deployment with Reverse Proxy

### Using Nginx

```nginx
server {
    listen 80;
    server_name sada.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📝 Useful Commands

```bash
# View container status
docker-compose ps

# View resource usage
docker stats sada_app

# Execute commands in container
docker-compose exec app sh

# Remove all containers and volumes
docker-compose down -v

# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f --tail=100

# Restart specific service
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build app
```

## 🎯 Development Workflow

1. **Start development environment:**
   ```bash
   docker-compose --profile dev up -d app-dev
   ```

2. **Make code changes** - they'll automatically reload

3. **View logs:**
   ```bash
   docker-compose logs -f app-dev
   ```

4. **Test in production mode:**
   ```bash
   docker-compose down
   docker-compose up -d app
   ```

## 📞 Support

For issues and questions:
- GitHub: https://github.com/bazhdarrzgar/sada
- Check logs: `docker-compose logs -f`
- Check health: `docker-compose ps`

## 📄 License

This deployment configuration is part of the Sada School Management System.
