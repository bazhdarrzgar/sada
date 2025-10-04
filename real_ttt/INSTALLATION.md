# SADA Project - Ubuntu Installation Guide

This guide provides comprehensive installation scripts for setting up the SADA project on a fresh Ubuntu system.

## 🚀 Quick Start

### Prerequisites
- Fresh Ubuntu 20.04+ system
- User account with sudo privileges
- Internet connection

### One-Command Installation

```bash
# Clone the project (if not already done)
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# Run the main installation script
./setup-ubuntu.sh
```

## 📋 Installation Scripts

### 1. `setup-ubuntu.sh` - Main Installation Script

This is the comprehensive installation script that sets up everything needed:

**What it installs:**
- ✅ Node.js 20.x (LTS)
- ✅ npm and Yarn package manager
- ✅ MongoDB 7.0
- ✅ Git
- ✅ Build tools and development utilities
- ✅ Nginx web server
- ✅ PM2 process manager
- ✅ Supervisor service manager
- ✅ UFW firewall configuration
- ✅ Project dependencies
- ✅ Database seeding

**Usage:**
```bash
chmod +x setup-ubuntu.sh
./setup-ubuntu.sh
```

### 2. `dev-setup.sh` - Development Environment Setup

Quick setup for development environment (run after main installation):

```bash
chmod +x dev-setup.sh
./dev-setup.sh
```

### 3. `deploy-production.sh` - Production Deployment

Sets up the application for production with PM2 and Nginx:

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

## 🔧 Manual Installation Steps

If you prefer to install manually or understand what the script does:

### 1. System Update
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget gnupg2 software-properties-common
```

### 2. Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn pm2 wait-on
```

### 3. Install MongoDB 7.0
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
    sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | \
    sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 4. Install Additional Tools
```bash
sudo apt install -y build-essential python3 python3-pip vim nano htop tree unzip zip jq nginx supervisor
```

### 5. Setup Project
```bash
# Install dependencies
yarn install

# Create environment file
cp .env.local.example .env.local  # Edit as needed

# Seed database
node scripts/seedDatabase.js

# Start development server
yarn dev
```

## 🌐 Environment Configuration

Create `.env.local` file with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
MONGO_URL=mongodb://localhost:27017
DB_NAME=berdoz_management

# Application Configuration
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Session Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# File Upload Configuration
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880

# Security Configuration
BCRYPT_ROUNDS=12

# Development Configuration
NEXT_TELEMETRY_DISABLED=1
```

## 🔒 Security Considerations

The installation script configures UFW firewall with the following rules:
- Allow SSH (port 22)
- Allow HTTP (port 80)
- Allow HTTPS (port 443)
- Allow development server (port 3000)
- Allow MongoDB from localhost only (port 27017)

## 🚀 Running the Application

### Development Mode
```bash
yarn dev
```
Access at: `http://localhost:3000`

### Production Mode
```bash
# Build the application
yarn build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Or start directly
yarn start
```

## 📊 Service Management

### MongoDB
```bash
sudo systemctl status mongod     # Check status
sudo systemctl start mongod      # Start MongoDB
sudo systemctl stop mongod       # Stop MongoDB
sudo systemctl restart mongod    # Restart MongoDB
```

### Application (PM2)
```bash
pm2 list                         # List applications
pm2 restart sada-app             # Restart application
pm2 stop sada-app               # Stop application
pm2 logs sada-app               # View logs
pm2 monit                       # Monitor applications
```

### Nginx
```bash
sudo systemctl status nginx      # Check status
sudo systemctl reload nginx      # Reload configuration
sudo nginx -t                    # Test configuration
```

## 🛠 Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   sudo chown -R $USER:$USER ~/.npm
   sudo chown -R $USER:$USER ~/.config
   ```

2. **Port Already in Use**
   ```bash
   sudo lsof -i :3000  # Find process using port 3000
   kill -9 <PID>       # Kill the process
   ```

3. **MongoDB Connection Issues**
   ```bash
   sudo systemctl status mongod
   sudo journalctl -u mongod
   ```

4. **Yarn Install Issues**
   ```bash
   yarn cache clean
   rm -rf node_modules
   rm yarn.lock
   yarn install
   ```

### Log Files
- Application logs: `./logs/`
- MongoDB logs: `/var/log/mongodb/mongod.log`
- Nginx logs: `/var/log/nginx/`
- PM2 logs: `~/.pm2/logs/`

## 📞 Support

If you encounter issues:
1. Check the log files mentioned above
2. Ensure all services are running
3. Verify firewall settings
4. Check environment variables

## 🎉 Installation Complete!

After successful installation, you should have:
- ✅ SADA application running on `http://localhost:3000`
- ✅ MongoDB database with sample data
- ✅ All development tools ready
- ✅ Production-ready configuration (if deployed)

**Default Login Credentials:**
- Username: `berdoz`
- Password: `berdoz@code`

Happy coding with SADA! 🚀