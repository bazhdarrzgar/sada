# Docker Setup Guide for SADA2 Application

This guide provides step-by-step instructions for setting up and running the SADA2 application using Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- sudo/administrator access

## Quick Start

1. **Clone and navigate to the project directory:**
   ```bash
   cd /path/to/sada2
   ```

2. **Install dependencies and generate lockfile:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   sudo docker-compose up -d
   ```

4. **Access the application:**
   - Open your browser and go to `http://localhost:3000`
   - The application should be running with MongoDB connected

## Services

The Docker Compose setup includes the following services:

### MongoDB Database
- **Container**: `sada_mongodb`
- **Image**: `mongo:7.0`
- **Port**: `27017`
- **Health Check**: Enabled with 30s intervals
- **Volumes**: Persistent data storage

### Next.js Application
- **Container**: `sada_app`
- **Image**: Built from local Dockerfile
- **Port**: `3000`
- **Environment**: Production mode
- **Dependencies**: Waits for MongoDB to be healthy

## Troubleshooting

### Common Issues and Solutions

#### 1. "Lockfile not found" Error
**Error**: `Lockfile not found.`

**Solution**:
```bash
# Generate package-lock.json
npm install

# Or if using yarn
yarn install
```

#### 2. Port Already in Use
**Error**: `address already in use` for port 27017

**Solution**:
```bash
# Check what's using the port
sudo ss -tlnp | grep :27017

# Stop local MongoDB service
sudo systemctl stop mongod

# Or change the port in docker-compose.yml
```

#### 3. Permission Denied
**Error**: `permission denied while trying to connect to the Docker daemon socket`

**Solution**:
```bash
# Use sudo with docker-compose
sudo docker-compose up -d

# Or add your user to docker group (requires logout/login)
sudo usermod -aG docker $USER
```

#### 4. Network Connectivity Issues
**Error**: `getaddrinfo EAI_AGAIN registry.yarnpkg.com`

**Solution**:
```bash
# Use npm instead of yarn
npm install

# Or configure yarn registry
yarn config set registry https://registry.npmjs.org/
```

#### 5. Obsolete Version Warning
**Warning**: `the attribute 'version' is obsolete`

**Solution**: The `version: '3.8'` line has been removed from `docker-compose.yml` in this setup.

## Development Mode

To run in development mode with hot reload:

```bash
# Start development services
sudo docker-compose --profile dev up -d

# This will start:
# - MongoDB on port 27017
# - Development app on port 3001
```

## Useful Commands

### Container Management
```bash
# View running containers
sudo docker-compose ps

# View logs
sudo docker-compose logs -f

# Stop all services
sudo docker-compose down

# Rebuild and restart
sudo docker-compose up -d --build

# Remove all containers and volumes
sudo docker-compose down -v
```

### Database Access
```bash
# Connect to MongoDB container
sudo docker exec -it sada_mongodb mongosh

# Backup database
sudo docker exec sada_mongodb mongodump --out /data/backup

# Restore database
sudo docker exec sada_mongodb mongorestore /data/backup
```

### Application Logs
```bash
# View application logs
sudo docker-compose logs -f app

# View MongoDB logs
sudo docker-compose logs -f mongodb
```

## Health Checks

Both services include health checks:

- **MongoDB**: Checks database connectivity every 30s
- **Application**: Checks HTTP endpoint every 30s

## Volumes and Data Persistence

- **MongoDB Data**: Stored in `mongodb_data` volume
- **MongoDB Config**: Stored in `mongodb_config` volume
- **Upload Files**: Mounted from `./public/upload` to `/app/public/upload`

## Environment Variables

The application uses the following environment variables:

- `NODE_ENV=production`
- `MONGODB_URI=mongodb://mongodb:27017/sada`
- `MONGO_URL=mongodb://mongodb:27017/sada`
- `NEXT_TELEMETRY_DISABLED=1`

## Production Deployment

For production deployment:

1. Ensure all environment variables are properly set
2. Use the production docker-compose file:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml up -d
   ```
3. Set up proper SSL certificates
4. Configure reverse proxy (nginx/Apache)
5. Set up monitoring and logging

## Security Considerations

- Change default MongoDB credentials in production
- Use Docker secrets for sensitive data
- Regularly update base images
- Implement proper firewall rules
- Use HTTPS in production

## Support

If you encounter issues not covered in this guide:

1. Check the application logs: `sudo docker-compose logs -f`
2. Verify container health: `sudo docker-compose ps`
3. Check system resources: `docker system df`
4. Review Docker daemon logs: `sudo journalctl -u docker`

## File Structure

```
sada2/
├── docker-compose.yml          # Main compose file
├── docker-compose.prod.yml     # Production compose file
├── Dockerfile                  # Production Dockerfile
├── Dockerfile.dev              # Development Dockerfile
├── package.json                # Node.js dependencies
├── package-lock.json           # Dependency lockfile
└── public/upload/              # File upload directory
```

---

**Last Updated**: $(date)
**Version**: 1.0
