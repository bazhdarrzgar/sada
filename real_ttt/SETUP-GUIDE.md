# 🚀 SADA Project - Complete Ubuntu Setup

This repository contains comprehensive installation scripts for setting up the SADA (Berdoz Management System) project on Ubuntu systems.

## 📋 Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `setup-ubuntu.sh` | **Main installer** - Complete system setup | `./setup-ubuntu.sh` |
| `dev-setup.sh` | Quick development environment setup | `./dev-setup.sh` |
| `deploy-production.sh` | Production deployment with PM2 + Nginx | `./deploy-production.sh` |
| `check-system.sh` | System health check and verification | `./check-system.sh` |

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# 2. Make scripts executable (if needed)
chmod +x *.sh

# 3. Run the main installation script
./setup-ubuntu.sh

# 4. Check system status
./check-system.sh

# 5. Start development server
yarn dev
```

## 🖥 System Requirements

- **OS**: Ubuntu 20.04+ (tested on 20.04, 22.04, 24.04)
- **RAM**: Minimum 2GB, Recommended 4GB+
- **Disk**: Minimum 10GB free space
- **Network**: Internet connection required for installation
- **User**: Regular user with sudo privileges (do not run as root)

## 📦 What Gets Installed

### Core Components
- ✅ **Node.js 20.x LTS** - JavaScript runtime
- ✅ **npm & Yarn** - Package managers
- ✅ **MongoDB 7.0** - Database server
- ✅ **PM2** - Process manager for production
- ✅ **Nginx** - Web server and reverse proxy

### Development Tools
- ✅ **Git** - Version control
- ✅ **Build essentials** - C++ compiler and tools
- ✅ **Python3** - For native module compilation
- ✅ **Development utilities** - vim, nano, htop, tree, etc.

### System Configuration
- ✅ **UFW Firewall** - Configured with appropriate rules
- ✅ **MongoDB Service** - Auto-start on boot
- ✅ **Log rotation** - For application logs
- ✅ **Environment templates** - Ready-to-use .env files

## 🔧 Detailed Installation Process

### 1. `setup-ubuntu.sh` - Main Installation

This comprehensive script performs the following:

```bash
# System updates and prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common

# Node.js 20.x installation
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g yarn pm2 wait-on

# MongoDB 7.0 installation
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org

# Additional tools and services
sudo apt install -y build-essential python3 python3-pip nginx supervisor

# Firewall configuration
sudo ufw allow ssh
sudo ufw allow 80,443,3000/tcp
sudo ufw --force enable

# Project setup
yarn install
node scripts/seedDatabase.js  # If available
```

### 2. `dev-setup.sh` - Development Environment

Quick setup for development work:
- Installs/updates project dependencies
- Checks MongoDB connection
- Seeds database with sample data
- Creates necessary directories
- Sets up environment files

### 3. `deploy-production.sh` - Production Deployment

Production-ready deployment with:
- Application build optimization
- PM2 cluster configuration
- Nginx reverse proxy setup
- Log rotation configuration
- SSL/HTTPS ready configuration
- Process monitoring setup

### 4. `check-system.sh` - System Verification

Comprehensive system health check:
- Verifies all required software versions
- Tests service connectivity
- Checks file permissions
- Validates configuration files
- Reports system status

## 🌐 Default Configuration

### Application URLs
- **Development**: http://localhost:3000
- **Production**: http://your-server-ip (via Nginx)

### Default Credentials
- **Username**: `berdoz`
- **Password**: `berdoz@code`

### Database
- **MongoDB URI**: `mongodb://localhost:27017`
- **Database Name**: `berdoz_management`

### Ports Used
- **3000**: Next.js application
- **27017**: MongoDB
- **80/443**: Nginx (production)

## 🛡 Security Features

### Firewall Rules (UFW)
```bash
22/tcp     ALLOW       SSH access
80/tcp     ALLOW       HTTP traffic
443/tcp    ALLOW       HTTPS traffic
3000/tcp   ALLOW       Development server
27017/tcp  ALLOW       MongoDB (localhost only)
```

### File Permissions
- Application files: `644` (readable)
- Executable scripts: `755` (executable)
- Upload directory: `755` (writable)
- Log files: `644` (readable)

### Security Best Practices
- MongoDB bound to localhost only
- Firewall enabled and configured
- Regular security updates via apt
- Process isolation with PM2
- Log file rotation configured

## 🔧 Configuration Files

### Environment Variables (`.env.local`)
```env
MONGODB_URI=mongodb://localhost:27017
MONGO_URL=mongodb://localhost:27017
DB_NAME=berdoz_management
NODE_ENV=development
PORT=3000
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

### PM2 Configuration (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'sada-app',
    script: 'yarn',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### Nginx Configuration (`/etc/nginx/sites-available/sada`)
```nginx
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📊 Service Management

### MongoDB
```bash
sudo systemctl status mongod      # Check status
sudo systemctl start mongod       # Start service
sudo systemctl stop mongod        # Stop service
sudo systemctl restart mongod     # Restart service
sudo systemctl enable mongod      # Enable auto-start
```

### Application (Development)
```bash
yarn dev                          # Start development server
yarn build                        # Build for production
yarn start                        # Start production server
```

### Application (Production with PM2)
```bash
pm2 start ecosystem.config.js     # Start application
pm2 restart sada-app             # Restart application
pm2 stop sada-app                # Stop application
pm2 delete sada-app              # Remove application
pm2 list                         # List applications
pm2 logs sada-app                # View logs
pm2 monit                        # Monitor applications
```

### Nginx
```bash
sudo systemctl status nginx       # Check status
sudo systemctl start nginx        # Start service
sudo systemctl reload nginx       # Reload configuration
sudo nginx -t                     # Test configuration
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Find process using port 3000
sudo lsof -i :3000
# Kill the process
kill -9 <PID>
```

#### 2. Permission Errors
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER ~/.config
```

#### 3. MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod
# View MongoDB logs
sudo journalctl -u mongod
# Restart MongoDB
sudo systemctl restart mongod
```

#### 4. Yarn Installation Issues
```bash
# Clear cache and reinstall
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

#### 5. Build Failures
```bash
# Clear Next.js cache
rm -rf .next
# Rebuild
yarn build
```

### Log Locations
- **Application logs**: `./logs/`
- **PM2 logs**: `~/.pm2/logs/`
- **MongoDB logs**: `/var/log/mongodb/mongod.log`
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **System logs**: `sudo journalctl -u <service-name>`

## 🚀 Performance Optimization

### Production Optimizations
- **Clustering**: PM2 runs in cluster mode using all CPU cores
- **Memory management**: Automatic restart on memory threshold
- **Caching**: Nginx serves static files directly
- **Compression**: Gzip compression enabled
- **Log rotation**: Prevents disk space issues

### Monitoring
```bash
# System monitoring
htop                              # Process monitor
df -h                            # Disk usage
free -h                          # Memory usage
sudo systemctl status mongodb    # Service status

# Application monitoring
pm2 monit                        # PM2 monitor
pm2 logs                         # Application logs
```

## 📚 Additional Resources

### Useful Commands
```bash
# Check system health
./check-system.sh

# View application logs
tail -f logs/combined.log

# Monitor MongoDB
mongosh --eval "db.runCommand({serverStatus: 1})"

# Backup database
mongodump --db berdoz_management --out ./backup

# Restore database
mongorestore --db berdoz_management ./backup/berdoz_management
```

### Environment-specific Commands

#### Development
```bash
yarn dev                         # Start with hot reload
yarn dev:preload                # Start with data preloading
NODE_ENV=development yarn dev    # Explicit development mode
```

#### Production
```bash
yarn build                      # Build optimized bundle
yarn start                      # Start production server
NODE_ENV=production yarn start  # Explicit production mode
pm2 start ecosystem.config.js   # Start with PM2
```

## 🆘 Getting Help

If you encounter issues:

1. **Check system status**: `./check-system.sh`
2. **View logs**: Check log files mentioned above
3. **Verify services**: Ensure MongoDB and other services are running
4. **Check network**: Ensure ports are not blocked
5. **Review configuration**: Verify environment variables

## ✅ Installation Verification

After installation, verify everything is working:

```bash
# 1. Check system components
./check-system.sh

# 2. Start application
yarn dev

# 3. Test in browser
# Visit: http://localhost:3000

# 4. Login with default credentials
# Username: berdoz
# Password: berdoz@code
```

---

## 🎉 Installation Complete!

Your SADA project should now be fully functional with:
- ✅ Complete development environment
- ✅ Production-ready configuration
- ✅ Database with sample data
- ✅ Security configurations
- ✅ Monitoring and logging
- ✅ Backup and maintenance scripts

**Happy coding with SADA! 🚀**