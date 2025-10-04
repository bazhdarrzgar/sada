# 🐳 Docker Setup - Complete Index

Welcome! This document helps you navigate all Docker-related files and scripts for Sada.

---

## 🚀 Quick Start (Choose One)

| Script | Purpose | Time | When to Use |
|--------|---------|------|-------------|
| **[quick-setup.sh](./quick-setup.sh)** | Fastest setup | 1 min | First time, testing |
| **[docker-setup.sh](./docker-setup.sh)** | Complete automated setup | 5-10 min | Production, full control |
| **[docker-start.sh](./docker-start.sh)** | Interactive management | - | Already setup, managing |

### Absolute Quickest Start

```bash
./quick-setup.sh
```

---

## 📜 All Scripts

### Setup Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| **quick-setup.sh** | One-command setup, no prompts | `./quick-setup.sh` |
| **docker-setup.sh** | Full interactive setup with checks | `./docker-setup.sh` |

### Management Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| **docker-start.sh** | Interactive menu for operations | `./docker-start.sh` |
| **status.sh** | Quick status check | `./status.sh` |
| **docker-health-check.sh** | Comprehensive health check | `./docker-health-check.sh` |
| **docker-verify.sh** | Verify configuration | `./docker-verify.sh` |

### Make Scripts Executable

If scripts aren't executable:
```bash
chmod +x *.sh
```

---

## 📚 Documentation

### Main Guides

| Document | Description | Read When |
|----------|-------------|-----------|
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Complete setup guide for all methods | Starting fresh |
| **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)** | Detailed Docker deployment guide | Production deployment |
| **[DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)** | Command cheat sheet | Daily operations |
| **[README.md](./README.md)** | Main project README | Overview |

### Configuration Files

| File | Description | Edit? |
|------|-------------|-------|
| **[.env.example](./.env.example)** | Environment template | Copy to .env |
| **.env** | Your environment config | Yes |
| **[docker-compose.yml](./docker-compose.yml)** | Service configuration | Advanced users |
| **[Dockerfile](./Dockerfile)** | Production image | Rarely |
| **[Dockerfile.dev](./Dockerfile.dev)** | Development image | Rarely |
| **[.dockerignore](./.dockerignore)** | Build exclusions | Rarely |

---

## 🎯 Common Tasks

### First Time Setup

```bash
# Option 1: Super quick (recommended)
./quick-setup.sh

# Option 2: Full setup with options
./docker-setup.sh

# Option 3: Manual
docker-compose up -d app
```

### Daily Operations

```bash
# Check status
./status.sh

# Interactive management
./docker-start.sh

# View logs
docker-compose logs -f app

# Restart
docker-compose restart app

# Stop
docker-compose down
```

### Health & Diagnostics

```bash
# Quick health check
./docker-health-check.sh

# Detailed health check with logs
./docker-health-check.sh -v

# Verify configuration
./docker-verify.sh

# Check containers
docker-compose ps
```

### Backup & Restore

```bash
# Backup database
docker cp sada_app:/app/database/sada.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db sada_app:/app/database/sada.db
docker-compose restart app

# Backup uploads
docker cp sada_app:/app/public/upload ./uploads-backup
```

### Updates

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

---

## 🔧 Deployment Modes

### Production Mode

```bash
# Start production
docker-compose up -d app

# Access
http://localhost:3000
```

**Features:**
- ✅ Optimized build
- ✅ Minimal image size
- ✅ Production-ready
- ✅ No hot reload

### Development Mode

```bash
# Start development
docker-compose --profile dev up -d app-dev

# Access
http://localhost:3001
```

**Features:**
- ✅ Hot reload enabled
- ✅ Source code mounted
- ✅ Debug tools
- ✅ Faster iteration

### Both Modes

```bash
# Start both
docker-compose up -d app
docker-compose --profile dev up -d app-dev
```

---

## 🐛 Troubleshooting

### Quick Fixes

```bash
# 1. Check if running
./status.sh

# 2. View logs
docker-compose logs -f app

# 3. Health check
./docker-health-check.sh -v

# 4. Restart
docker-compose restart app

# 5. Full rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Common Issues

**Issue: Port already in use**
```bash
# Find process
lsof -i :3000

# Stop it or change port in docker-compose.yml
```

**Issue: Container won't start**
```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose build --no-cache app
docker-compose up -d app
```

**Issue: Database issues**
```bash
# Check database file
docker-compose exec app ls -lh /app/database/

# Fix permissions
docker-compose exec -u root app chown -R nextjs:nodejs /app/database
```

**Issue: Can't access application**
```bash
# Check if container is running
docker-compose ps

# Check health
docker inspect --format='{{.State.Health.Status}}' sada_app

# Check network
curl http://localhost:3000
```

---

## 📊 File Structure

```
/app/
├── 🚀 Setup Scripts
│   ├── quick-setup.sh              # 1-minute setup
│   ├── docker-setup.sh             # Complete setup
│   └── docker-start.sh             # Interactive management
│
├── 🔍 Diagnostic Scripts
│   ├── status.sh                   # Quick status
│   ├── docker-health-check.sh      # Health check
│   └── docker-verify.sh            # Configuration check
│
├── 📚 Documentation
│   ├── DOCKER_INDEX.md             # This file
│   ├── SETUP_GUIDE.md              # Complete setup guide
│   ├── DOCKER_DEPLOYMENT.md        # Deployment guide
│   ├── DOCKER_QUICK_REFERENCE.md   # Command reference
│   └── README.md                   # Main README
│
├── 🐳 Docker Configuration
│   ├── docker-compose.yml          # Services config
│   ├── Dockerfile                  # Production image
│   ├── Dockerfile.dev              # Development image
│   └── .dockerignore               # Build exclusions
│
├── ⚙️ Configuration
│   ├── .env.example                # Environment template
│   └── .env                        # Your config (create this)
│
└── 📁 Application Files
    ├── app/                        # Next.js pages
    ├── components/                 # React components
    ├── database/                   # SQLite database
    ├── public/                     # Static files
    └── ...
```

---

## 🎓 Learning Path

### Complete Beginner
1. Read [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Run `./quick-setup.sh`
3. Access application
4. Read [README.md](./README.md) for features

### Some Docker Experience
1. Run `./docker-setup.sh`
2. Choose your deployment mode
3. Read [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
4. Bookmark [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)

### Advanced User
1. Review `docker-compose.yml`
2. Customize as needed
3. Use manual commands
4. Read [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for optimization

---

## 🔗 Quick Links

### Getting Started
- [Setup Guide](./SETUP_GUIDE.md) - All setup methods
- [Quick Setup Script](./quick-setup.sh) - Fastest start
- [Complete Setup Script](./docker-setup.sh) - Full automation

### Daily Use
- [Management Script](./docker-start.sh) - Interactive menu
- [Status Check](./status.sh) - Quick status
- [Health Check](./docker-health-check.sh) - Diagnostics

### Reference
- [Quick Reference](./DOCKER_QUICK_REFERENCE.md) - Commands
- [Deployment Guide](./DOCKER_DEPLOYMENT.md) - Details
- [Main README](./README.md) - Project overview

### Configuration
- [Environment Template](./.env.example) - Variables
- [Docker Compose](./docker-compose.yml) - Services
- [Verify Config](./docker-verify.sh) - Check setup

---

## ✅ Checklist for New Users

- [ ] Read this index
- [ ] Choose setup method (quick-setup.sh recommended)
- [ ] Run setup
- [ ] Access application (http://localhost:3000)
- [ ] Login with default credentials
- [ ] Change default password
- [ ] Bookmark DOCKER_QUICK_REFERENCE.md
- [ ] Setup backups

---

## 🆘 Need Help?

1. **Check documentation:**
   - Start with [SETUP_GUIDE.md](./SETUP_GUIDE.md)
   - Check [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)
   - Use [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md)

2. **Run diagnostics:**
   ```bash
   ./status.sh                      # Quick status
   ./docker-health-check.sh -v      # Detailed check
   ./docker-verify.sh               # Config check
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f app
   cat docker-setup.log             # Setup log
   ```

4. **Get support:**
   - GitHub Issues: https://github.com/bazhdarrzgar/sada/issues
   - Include: OS, Docker version, error messages, logs

---

## 🎉 You're All Set!

Everything you need is documented. Start with:

```bash
./quick-setup.sh
```

For daily management:

```bash
./docker-start.sh
```

Happy school managing! 🏫
