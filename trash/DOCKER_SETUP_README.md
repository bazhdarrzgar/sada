# 🐳 Docker Setup Guide for Berdoz Management System (SADA)

A comprehensive guide for deploying the Berdoz Management System using Docker and Docker Compose with production-ready optimizations.

## 📋 Prerequisites

- **Docker** v20.10+ installed
- **Docker Compose** v2.0+ installed  
- **Minimum System Requirements:**
  - 2GB RAM
  - 10GB free disk space
  - Internet connection for initial setup

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd sada

# Run the automated setup script
chmod +x quick-docker-setup.sh
./quick-docker-setup.sh
```

### Option 2: Manual Setup
```bash
# 1. Navigate to project directory
cd /path/to/sada

# 2. Install dependencies (generates lockfile if missing)
yarn install

# 3. Start the application
docker-compose up -d

# 4. Access the application
# Open: http://localhost:3000
```

## 🏗️ Architecture

The Docker setup consists of:

### 🗄️ MongoDB Database Service
- **Container**: `sada_mongodb`
- **Image**: `mongo:7.0` (Latest stable)
- **Port**: `27017`
- **Features**: 
  - Health checks with 30s intervals
  - Persistent data storage
  - Automatic database initialization

### 🌐 Next.js Application Service
- **Container**: `sada_app`
- **Build**: Multi-stage optimized Dockerfile
- **Port**: `3000`
- **Features**:
  - Production-optimized build
  - Health monitoring
  - File upload persistence
  - Automatic restart policies

### 🔧 Development Service (Optional)
- **Container**: `sada_app_dev`
- **Profile**: `dev`
- **Port**: `3000`
- **Features**: Hot reload, volume mounting

## 🛠️ Available Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Start with development profile
docker-compose --profile dev up -d

# View service status
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ Data Loss)
docker-compose down -v
```

### Development & Debugging
```bash
# Rebuild services
docker-compose up -d --build

# Execute shell in app container
docker-compose exec app sh

# Connect to MongoDB
docker-compose exec mongodb mongosh sada

# View resource usage
docker stats sada_app sada_mongodb
```

### Production Deployment
```bash
# Production with SSL and optimizations
docker-compose -f docker-compose.prod.yml up -d

# Scale application (if configured)
docker-compose up -d --scale app=3
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Database
MONGODB_URI=mongodb://mongodb:27017/sada
MONGO_URL=mongodb://mongodb:27017/sada
MONGO_INITDB_DATABASE=sada

# Security (Production)
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password

# Application Specific
UPLOAD_MAX_SIZE=10MB
SESSION_SECRET=your_session_secret
```

### Volume Mounts
- **MongoDB Data**: `mongodb_data:/data/db` (Persistent)
- **MongoDB Config**: `mongodb_config:/data/configdb` (Persistent)
- **File Uploads**: `./public/upload:/app/public/upload` (Host mounted)

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. 🔒 Permission Denied
```bash
# Problem: Docker daemon socket access denied
# Solution: Add user to docker group
sudo usermod -aG docker $USER
# Then logout and login again

# Alternative: Use sudo
sudo docker-compose up -d
```

#### 2. 📦 Missing Lockfile
```bash
# Problem: "Lockfile not found" error
# Solution: Generate lockfile
yarn install  # Preferred
# or
npm install
```

#### 3. 🔌 Port Conflicts
```bash
# Problem: Port 27017 already in use
# Check what's using the port
sudo netstat -tlnp | grep :27017

# Stop conflicting service
sudo systemctl stop mongod

# Or modify docker-compose.yml ports
ports:
  - "27018:27017"  # Use different external port
```

#### 4. 🌐 Network Issues
```bash
# Problem: Cannot reach external registries
# Solution: Configure Docker DNS
echo '{"dns": ["8.8.8.8", "8.8.4.4"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker

# Or use offline mode
yarn install --offline
```

#### 5. 💾 Disk Space Issues
```bash
# Clean up Docker system
docker system prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

#### 6. 🏥 Health Check Failures
```bash
# Check container health
docker-compose ps

# View health check logs
docker inspect sada_app | grep -A 10 Health

# Manual health check
curl -f http://localhost:3000 || echo "App not responding"
```

## 📊 Monitoring & Maintenance

### Health Monitoring
Both services include comprehensive health checks:

- **MongoDB**: Database connectivity test every 30s
- **Application**: HTTP endpoint check every 30s
- **Startup**: 40s grace period for application startup

### Log Management
```bash
# Rotate logs (prevent disk filling)
docker-compose logs --tail=1000 app > app_logs_$(date +%Y%m%d).log

# Monitor real-time
docker-compose logs -f --tail=50

# Export logs for analysis
docker-compose logs --since=24h app > recent_logs.txt
```

### Backup & Recovery
```bash
# Backup MongoDB
docker-compose exec mongodb mongodump --out /tmp/backup
docker cp sada_mongodb:/tmp/backup ./mongodb_backup_$(date +%Y%m%d)

# Restore MongoDB
docker cp ./mongodb_backup sada_mongodb:/tmp/restore
docker-compose exec mongodb mongorestore /tmp/restore
```

## 🔒 Production Security

### Security Checklist
- [ ] Change default MongoDB credentials
- [ ] Use Docker secrets for sensitive data
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS with SSL certificates
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Monitor container logs
- [ ] Implement log rotation

### SSL Configuration (Production)
```bash
# Add SSL certificates to docker-compose.prod.yml
volumes:
  - /path/to/ssl/certs:/app/certs:ro

environment:
  - SSL_CERT_PATH=/app/certs/fullchain.pem
  - SSL_KEY_PATH=/app/certs/privkey.pem
```

## 📁 Project Structure

```
sada/
├── 🐳 docker-compose.yml          # Main compose configuration
├── 🐳 docker-compose.prod.yml     # Production configuration  
├── 🐳 Dockerfile                  # Optimized production build
├── 🐳 Dockerfile.dev              # Development with hot reload
├── 📦 package.json                # Node.js dependencies
├── 🔒 yarn.lock                   # Dependency lockfile
├── ⚙️ next.config.js              # Next.js configuration
├── 📁 public/upload/              # File uploads (persistent)
├── 🔧 .dockerignore               # Docker build exclusions
├── 🚀 quick-docker-setup.sh       # Automated setup script
└── 📚 DOCKER_SETUP_README.md      # This guide
```

## 🚀 Performance Optimization

### Docker Optimizations Applied
- ✅ Multi-stage builds for smaller images
- ✅ Layer caching optimization
- ✅ Non-root user for security
- ✅ Health checks for reliability
- ✅ Standalone Next.js output
- ✅ Alpine Linux base (smaller footprint)
- ✅ Proper file permissions

### Resource Limits (Optional)
Add to docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## 📞 Support & Debugging

### Getting Help
1. **Check logs first**: `docker-compose logs -f`
2. **Verify container health**: `docker-compose ps`
3. **Check system resources**: `docker system df`
4. **Review Docker daemon**: `sudo journalctl -u docker`

### Debug Mode
```bash
# Enable debug logging
export COMPOSE_LOG_LEVEL=DEBUG
docker-compose up -d

# Run single service for debugging
docker-compose run --rm app sh
```

## 📋 Version Information

- **Docker Compose Format**: v3.8+
- **Node.js**: v18 Alpine
- **MongoDB**: v7.0
- **Next.js**: v14.2.3
- **Guide Version**: 2.0
- **Last Updated**: November 2024

---

**💡 Pro Tip**: Use `docker-compose --profile dev up -d` for development with hot reload on port 3000, while keeping production on port 3000.
