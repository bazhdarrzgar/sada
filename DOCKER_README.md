# Docker Setup for Sada Project

This document explains how to run the Sada project using Docker and Docker Compose.

## 🐳 Docker Configuration

The project includes the following Docker files:

- **`Dockerfile`** - Production-optimized multi-stage build
- **`Dockerfile.dev`** - Development version with hot reload
- **`docker-compose.yml`** - Complete stack with MongoDB
- **`.dockerignore`** - Excludes unnecessary files from Docker build
- **`.env.docker`** - Environment variables for Docker deployment

## 🚀 Quick Start

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### 1. Production Deployment

Run the complete stack in production mode:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The application will be available at: **http://localhost:3000**

### 2. Development Mode

For development with hot reload:

```bash
# Start in development mode
docker-compose --profile dev up -d

# This will run the app on port 3000 with hot reload
# Available at: http://localhost:3000
```

### 3. Build Only Application

If you want to build just the application without MongoDB:

```bash
# Build the Docker image
docker build -t sada-app .

# Run the container (requires external MongoDB)
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://your-mongo-host:27017/sada \
  sada-app
```

## 📋 Services

### Application Service (`app`)
- **Image**: Built from Dockerfile
- **Port**: 3000
- **Environment**: Production
- **Features**: Optimized Next.js standalone build

### Development Service (`app-dev`)
- **Image**: Built from Dockerfile.dev  
- **Port**: 3000
- **Environment**: Development
- **Features**: Hot reload, volume mounting
- **Profile**: `dev` (optional service)

### MongoDB Service (`mongodb`)
- **Image**: mongo:7.0
- **Port**: 27017
- **Database**: sada
- **Volumes**: Persistent data storage

## 🔧 Configuration

### Environment Variables

The Docker setup uses these environment variables:

```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/sada
MONGO_URL=mongodb://mongodb:27017/sada
NEXT_TELEMETRY_DISABLED=1
```

### Volume Mounts

- **`mongodb_data`**: MongoDB data persistence
- **`mongodb_config`**: MongoDB configuration
- **`./public/upload`**: File uploads (mounted to host for persistence)

### Networks

- **`sada_network`**: Bridge network for service communication

## 🛠️ Commands Reference

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Start with logs visible
docker-compose up

# Stop all services
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Rebuild and start
docker-compose up -d --build
```

### Development Operations
```bash
# Start development mode
docker-compose --profile dev up -d

# View development logs
docker-compose --profile dev logs -f app-dev

# Stop development services
docker-compose --profile dev down
```

### Maintenance Operations
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Execute commands in containers
docker-compose exec app sh
docker-compose exec mongodb mongosh

# View running containers
docker-compose ps

# Restart specific service
docker-compose restart app
```

### Database Operations
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh sada

# Backup database
docker-compose exec mongodb mongodump --db sada --out /data/backup

# View database files
docker-compose exec mongodb ls -la /data/db
```

## 📊 Monitoring

### Health Checks
```bash
# Check if services are running
docker-compose ps

# Check application health
curl http://localhost:3000

# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

### Resource Usage
```bash
# View resource usage
docker stats $(docker-compose ps -q)

# View detailed container info
docker-compose exec app top
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill process or change port in docker-compose.yml
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Verify network connectivity
   docker-compose exec app ping mongodb
   ```

3. **Application Won't Start**
   ```bash
   # Check application logs
   docker-compose logs app
   
   # Rebuild without cache
   docker-compose build --no-cache app
   ```

4. **Volume Issues**
   ```bash
   # Remove volumes and restart
   docker-compose down -v
   docker-compose up -d
   ```

### Reset Everything
```bash
# Nuclear option - remove everything
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## 🚀 Production Deployment

For production deployment:

1. **Update Environment Variables**:
   - Set production MongoDB URI
   - Configure proper hostnames
   - Set secure environment variables

2. **Enable SSL/TLS**:
   - Add reverse proxy (Nginx/Traefik)
   - Configure SSL certificates
   - Update CORS settings

3. **Scaling**:
   ```bash
   # Scale application instances
   docker-compose up -d --scale app=3
   ```

4. **Monitoring**:
   - Add health checks
   - Configure logging
   - Set up monitoring tools

## 📝 Notes

- The production build uses Next.js standalone output for optimal performance
- MongoDB data persists across container restarts
- File uploads are mounted to host for persistence
- Development mode supports hot reload for faster development
- All services communicate through a dedicated Docker network

For more information about the application itself, refer to the main README.md file.