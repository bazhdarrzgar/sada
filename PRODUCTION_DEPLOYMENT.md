# 🏗️ SADA Management System - Production Deployment Guide

## Overview
This guide helps you deploy the SADA Management System on a production Ubuntu VPS with limited resources (1GB RAM, 1 CPU core, 30GB SSD).

## 🚀 Quick Start (Recommended)

### Step 0: Pre-Deployment Check (Highly Recommended)
```bash
# Check if your VPS is ready for deployment
wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/pre-deployment-check.sh
chmod +x pre-deployment-check.sh
./pre-deployment-check.sh
```

### Option 1: Full Production Deployment (Recommended)
```bash
# Download and run the complete production deployment script
wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/deploy-sada-production.sh
chmod +x deploy-sada-production.sh
./deploy-sada-production.sh
```

### Option 2: Quick Deployment (Basic)
```bash
# Download and run the quick deployment script
wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/quick-deploy.sh
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## 📋 Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04 LTS or newer
- **RAM**: Minimum 1GB (2GB recommended)
- **CPU**: 1 core minimum
- **Storage**: 5GB free space minimum
- **Network**: Public IP address
- **Domain**: Optional but recommended for SSL

### Before You Start
1. **Update your system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Create a non-root user** (if not already done):
   ```bash
   sudo adduser sada
   sudo usermod -aG sudo sada
   su - sada
   ```

## 🔧 Manual Deployment Steps

If you prefer manual deployment, follow these steps:

### 1. Install Dependencies
```bash
# Update package list
sudo apt update

# Install essential packages
sudo apt install -y curl wget git nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group changes
exit
# SSH back in
```

### 2. Clone Repository
```bash
git clone https://github.com/bazhdarrzgar/sada.git
cd sada
```

### 3. Configure Environment
```bash
# Generate secure MongoDB password
MONGO_PASSWORD=$(openssl rand -base64 32)

# Create production environment file
cat << EOF > .env.production
NODE_ENV=production
MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/sada?authSource=admin
MONGO_URL=mongodb://admin:${MONGO_PASSWORD}@mongodb:27017/sada?authSource=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
NEXT_TELEMETRY_DISABLED=1
DOCKER_ENV=true
EOF
```

### 4. Create Memory-Optimized Docker Compose
```bash
cat << 'EOF' > docker-compose.production.yml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: sada_mongodb_prod
    restart: unless-stopped
    environment:
      MONGO_INITDB_DATABASE: sada
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
    ports:
      - "127.0.0.1:27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - sada_network
    deploy:
      resources:
        limits:
          memory: 300m
    command: >
      mongod 
      --auth 
      --wiredTigerCacheSizeGB=0.15
      --maxConns=100

  app:
    build: .
    container_name: sada_app_prod
    restart: unless-stopped
    env_file: .env.production
    environment:
      - NODE_OPTIONS=--max-old-space-size=400
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      - mongodb
    networks:
      - sada_network
    volumes:
      - upload_data:/app/public/upload
    deploy:
      resources:
        limits:
          memory: 450m

volumes:
  mongodb_data:
  upload_data:

networks:
  sada_network:
    driver: bridge
EOF
```

### 5. Configure Nginx (Optional but Recommended)
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/sada > /dev/null << 'EOF'
server {
    listen 80;
    server_name YOUR_DOMAIN_HERE;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Replace YOUR_DOMAIN_HERE with your actual domain
sudo sed -i 's/YOUR_DOMAIN_HERE/yourdomain.com/g' /etc/nginx/sites-available/sada

# Enable site
sudo ln -s /etc/nginx/sites-available/sada /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 7. Deploy Application
```bash
# Build and start services
docker-compose -f docker-compose.production.yml --env-file .env.production up -d --build

# Check status
docker-compose -f docker-compose.production.yml ps
```

### 8. Set Up SSL (Optional)
```bash
# Install SSL certificate (replace with your domain and email)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email your-email@domain.com --redirect

# Set up auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

## 🔧 System Optimizations for 1GB RAM VPS

### 1. Create Swap File
```bash
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Optimize swap usage
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### 2. Configure Docker for Low Memory
```bash
sudo mkdir -p /etc/docker
cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "max-concurrent-downloads": 2,
    "max-concurrent-uploads": 2
}
EOF

sudo systemctl restart docker
```

## 📊 Monitoring and Maintenance

### Check System Status
```bash
# Check memory usage
free -h

# Check disk usage
df -h

# Check Docker container status
docker stats

# Check application logs
docker-compose -f docker-compose.production.yml logs -f app

# Check MongoDB logs
docker-compose -f docker-compose.production.yml logs -f mongodb
```

### Create Monitoring Script
```bash
cat << 'EOF' > monitor.sh
#!/bin/bash
echo "=== SADA System Status ==="
echo "Date: $(date)"
echo
echo "Memory Usage:"
free -h
echo
echo "Disk Usage:"
df -h /
echo
echo "Docker Status:"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo
echo "Application Health:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q 200 && echo "✅ OK" || echo "❌ Failed"
EOF

chmod +x monitor.sh
```

### Backup Script
```bash
cat << 'EOF' > backup.sh
#!/bin/bash
BACKUP_DIR="$HOME/sada-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec sada_mongodb_prod mongodump --authenticationDatabase admin -u admin -p "$MONGO_ROOT_PASSWORD" --out /tmp/backup
docker cp sada_mongodb_prod:/tmp/backup $BACKUP_DIR/mongodb_$DATE

# Backup uploads
docker cp sada_app_prod:/app/public/upload $BACKUP_DIR/uploads_$DATE

# Create archive
cd $BACKUP_DIR
tar -czf sada_backup_$DATE.tar.gz mongodb_$DATE uploads_$DATE
rm -rf mongodb_$DATE uploads_$DATE

echo "Backup created: sada_backup_$DATE.tar.gz"
EOF

chmod +x backup.sh
```

## 🚨 Troubleshooting

### Common Issues

1. **Out of Memory Errors**
   ```bash
   # Check memory usage
   free -h
   docker stats
   
   # Restart services if needed
   docker-compose -f docker-compose.production.yml restart
   ```

2. **Application Not Starting**
   ```bash
   # Check logs
   docker-compose -f docker-compose.production.yml logs app
   
   # Check if ports are available
   sudo netstat -tulpn | grep :3000
   ```

3. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose -f docker-compose.production.yml logs mongodb
   
   # Test MongoDB connection
   docker exec -it sada_mongodb_prod mongosh -u admin -p
   ```

4. **SSL Certificate Issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates manually
   sudo certbot renew
   ```

### Performance Tuning

1. **For very low memory situations**:
   - Reduce MongoDB cache: `--wiredTigerCacheSizeGB=0.1`
   - Reduce Node.js heap: `NODE_OPTIONS=--max-old-space-size=300`

2. **Monitor resource usage**:
   ```bash
   # Real-time monitoring
   htop
   
   # Docker resource usage
   docker stats --no-stream
   ```

## 📚 Additional Resources

- [MongoDB Memory Usage](https://docs.mongodb.com/manual/faq/storage/)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Docker Resource Constraints](https://docs.docker.com/config/containers/resource_constraints/)
- [Nginx Configuration](https://nginx.org/en/docs/http/ngx_http_core_module.html)

## 🔐 Security Best Practices

1. **Regular Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose -f docker-compose.production.yml pull
   docker-compose -f docker-compose.production.yml up -d
   ```

2. **Backup Strategy**:
   - Schedule daily backups
   - Store backups off-site
   - Test restore procedures

3. **Monitoring**:
   - Set up log monitoring
   - Monitor disk space
   - Monitor memory usage

4. **Firewall**:
   - Only open necessary ports
   - Use fail2ban for intrusion prevention
   - Regular security audits

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify system resources
3. Review the troubleshooting section
4. Check Docker and system status

---

**Happy Deploying! 🚀**