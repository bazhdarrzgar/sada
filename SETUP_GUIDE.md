# 📖 Sada Complete Setup Guide

This guide covers all methods to setup and run Sada School Management System.

## 🎯 Choose Your Setup Method

| Method | Best For | Time | Difficulty |
|--------|----------|------|------------|
| [Quick Setup](#-quick-setup-1-minute) | First-time users, testing | 1 min | ⭐ Easy |
| [Complete Docker Setup](#-complete-docker-setup) | Production deployment | 5-10 min | ⭐⭐ Medium |
| [Manual Docker](#-manual-docker-setup) | Advanced users | 3-5 min | ⭐⭐ Medium |
| [Local Development](#-local-development-setup) | Developers | 5 min | ⭐⭐⭐ Advanced |

---

## 🚀 Quick Setup (1 Minute)

**The fastest way to get Sada running!**

### Prerequisites
- Docker installed and running
- Port 3000 available

### Steps

```bash
# 1. Clone repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# 2. Run quick setup
./quick-setup.sh
```

That's it! The script will:
- ✅ Check Docker is installed and running
- ✅ Verify port 3000 is available
- ✅ Create environment configuration
- ✅ Build and start the application
- ✅ Wait for application to be ready

### Access

Open your browser and go to:
- **URL:** http://localhost:3000
- **Username:** berdoz
- **Password:** berdoz@code

---

## 🔧 Complete Docker Setup

**Full automated setup with checks and options.**

### What This Does

The complete setup script will:
1. Check all prerequisites (Docker, Docker Compose)
2. Offer to install missing components
3. Check system resources (ports, disk space)
4. Setup environment files
5. Let you choose deployment mode (production/development/both)
6. Build Docker images
7. Start containers
8. Verify everything is working
9. Show you how to access the application

### Steps

```bash
# 1. Clone repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# 2. Run complete setup
./docker-setup.sh
```

### Interactive Prompts

The script will ask you:

1. **Install Docker?** (if not installed)
   - Automatically installs on Linux
   - Guides you on macOS/Windows

2. **Deployment Mode:**
   - **Production** - Optimized build, port 3000
   - **Development** - Hot reload, port 3001
   - **Both** - Run both modes simultaneously

3. **Continue with occupied ports?** (if ports are in use)
   - You can choose to continue or stop

### After Setup

You'll see a summary with:
- ✅ Access URLs
- ✅ Default credentials
- ✅ Useful commands
- ✅ Next steps

---

## 🛠️ Manual Docker Setup

**For users who prefer manual control.**

### Prerequisites

Install Docker and Docker Compose first:

**Linux:**
```bash
# Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and log back in

# Docker Compose (if not included)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**macOS:**
```bash
# Using Homebrew
brew install --cask docker

# Or download Docker Desktop from docker.com
```

**Windows:**
```bash
# Download Docker Desktop from docker.com
# Install and restart
```

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# 2. (Optional) Create .env file
cp .env.example .env
# Edit .env if needed

# 3. Build and start
docker-compose up -d app

# 4. Check status
docker-compose ps

# 5. View logs
docker-compose logs -f app
```

### Development Mode

```bash
# Start development version with hot reload
docker-compose --profile dev up -d app-dev

# Access at http://localhost:3001
```

### Useful Commands

```bash
# Stop
docker-compose down

# Restart
docker-compose restart app

# Rebuild
docker-compose up -d --build app

# View logs
docker-compose logs -f app

# Access container shell
docker-compose exec app sh
```

---

## 💻 Local Development Setup

**For developers who want to run without Docker.**

### Prerequisites

1. **Node.js 18+**
   ```bash
   # Check version
   node --version
   
   # Install via nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 18
   nvm use 18
   ```

2. **Yarn Package Manager**
   ```bash
   # Install yarn
   npm install -g yarn
   
   # Verify
   yarn --version
   ```

3. **Build Tools** (for better-sqlite3)
   
   **Linux:**
   ```bash
   sudo apt-get install python3 make g++
   ```
   
   **macOS:**
   ```bash
   xcode-select --install
   ```
   
   **Windows:**
   ```bash
   npm install --global windows-build-tools
   ```

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# 2. Install dependencies
yarn install

# 3. Start development server
yarn dev
```

### Access

Open browser at:
- **URL:** http://localhost:3000
- **Username:** berdoz
- **Password:** berdoz@code

### Available Scripts

```bash
# Development (with hot reload)
yarn dev

# Production build
yarn build

# Start production server
yarn start

# Development with data preloading
yarn dev:preload

# Smart port detection
yarn dev:smart
```

### Development Tips

1. **Database Location:** `./database/sada.db`
2. **Uploads:** `./public/upload/`
3. **Hot Reload:** Changes auto-reload in browser
4. **SQLite Browser:** Use tools like DB Browser for SQLite to inspect database

---

## 🔍 Verification

### Check if Running

```bash
# Docker deployments
docker-compose ps

# Or use health check script
./docker-health-check.sh
```

### Test Application

```bash
# Test HTTP endpoint
curl http://localhost:3000

# Should return 200 OK
```

### View Logs

```bash
# Docker
docker-compose logs -f app

# Local development
# Logs appear in terminal where you ran yarn dev
```

---

## 🐛 Troubleshooting

### Docker Issues

**Problem: Docker not found**
```bash
# Install Docker first
curl -fsSL https://get.docker.com | sh
```

**Problem: Docker daemon not running**
```bash
# Linux
sudo systemctl start docker

# macOS/Windows
# Start Docker Desktop application
```

**Problem: Port 3000 already in use**
```bash
# Find what's using the port
lsof -i :3000

# Kill the process (replace PID)
kill -9 <PID>

# Or change port in docker-compose.yml
```

**Problem: Build fails**
```bash
# Clean build
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

**Problem: Container starts but app doesn't respond**
```bash
# Check logs
docker-compose logs app

# Check container status
docker inspect sada_app

# Try restarting
docker-compose restart app
```

### Local Development Issues

**Problem: better-sqlite3 compilation fails**
```bash
# Install build tools
# Linux
sudo apt-get install python3 make g++

# macOS
xcode-select --install

# Windows
npm install --global windows-build-tools

# Rebuild
yarn install --force
```

**Problem: Port 3000 in use**
```bash
# Use different port
PORT=3001 yarn dev

# Or kill process using port 3000
lsof -i :3000
kill -9 <PID>
```

**Problem: Module not found errors**
```bash
# Clean install
rm -rf node_modules yarn.lock
yarn install
```

---

## 📊 Post-Setup

### Change Default Credentials

**Important:** Change default password immediately!

1. Login with `berdoz` / `berdoz@code`
2. Go to Settings → User Profile
3. Change password
4. (Optional) Create new admin user
5. Delete or disable default account

### Configure Email (Optional)

Edit `.env` file:

```env
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Restart application:
```bash
docker-compose restart app
```

### Setup Backups

**Docker:**
```bash
# Create backup
docker cp sada_app:/app/database/sada.db ./backup-$(date +%Y%m%d).db

# Schedule with cron
crontab -e
# Add: 0 2 * * * docker cp sada_app:/app/database/sada.db /backups/sada-$(date +\%Y\%m\%d).db
```

**Local:**
```bash
# Copy database
cp database/sada.db backups/sada-$(date +%Y%m%d).db

# Schedule with cron
crontab -e
# Add: 0 2 * * * cp /path/to/sada/database/sada.db /path/to/backups/sada-$(date +\%Y\%m\%d).db
```

### Update Application

**Docker:**
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

**Local:**
```bash
git pull
yarn install
yarn build
# Restart your process
```

---

## 📚 Next Steps

After setup, check out:

1. **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** - Complete Docker guide
2. **[DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)** - Command cheat sheet
3. **Application Documentation** - In-app help and tutorials
4. **GitHub Issues** - Report bugs or request features

---

## 🆘 Getting Help

1. **Check logs:**
   - Docker: `docker-compose logs -f app`
   - Local: Check terminal output

2. **Run diagnostics:**
   ```bash
   ./docker-verify.sh          # Verify configuration
   ./docker-health-check.sh -v # Detailed health check
   ```

3. **Search existing issues:**
   - GitHub: https://github.com/bazhdarrzgar/sada/issues

4. **Ask for help:**
   - Create GitHub issue with:
     - What you tried
     - Error messages
     - System info (OS, Docker version)

---

## ✅ Setup Checklist

- [ ] Prerequisites installed (Docker or Node.js)
- [ ] Repository cloned
- [ ] Application started successfully
- [ ] Can access at http://localhost:3000
- [ ] Can login with default credentials
- [ ] Changed default password
- [ ] Backup strategy configured
- [ ] Read relevant documentation

---

**🎉 Congratulations! You're all set up!**

For day-to-day management, use:
- `./docker-start.sh` - Interactive menu
- `./docker-health-check.sh` - Check health
- `docker-compose logs -f` - View logs
