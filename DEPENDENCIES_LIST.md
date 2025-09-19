# 📦 SADA Management System - Complete Dependencies List

This document lists all software packages and dependencies that will be installed on your Ubuntu VPS during the SADA deployment process.

## 🔧 System Dependencies

### Essential System Packages
- **curl** - Command line tool for transferring data
- **wget** - Network downloader
- **git** - Version control system
- **htop** - Interactive process viewer
- **iotop** - I/O monitoring tool
- **nethogs** - Network bandwidth monitoring
- **tree** - Directory structure display
- **vim** - Text editor
- **nano** - Simple text editor
- **ufw** - Uncomplicated Firewall
- **fail2ban** - Intrusion prevention software
- **unzip** - Archive extraction utility
- **zip** - Archive creation utility
- **tar** - Archive manipulation tool
- **gzip** - Compression utility
- **software-properties-common** - Common software properties
- **apt-transport-https** - HTTPS transport for APT
- **ca-certificates** - Common CA certificates
- **gnupg** - GNU Privacy Guard
- **lsb-release** - LSB release information
- **build-essential** - Build tools (gcc, make, etc.)
- **openssl** - SSL/TLS cryptography toolkit
- **cron** - Task scheduler
- **logrotate** - Log rotation utility
- **rsync** - File synchronization tool
- **screen** - Terminal multiplexer
- **tmux** - Terminal multiplexer (alternative)

### Networking & Monitoring Tools
- **net-tools** - Networking utilities (netstat, ifconfig)
- **dnsutils** - DNS lookup utilities (dig, nslookup)
- **traceroute** - Network route tracing
- **tcpdump** - Network packet analyzer
- **nmap** - Network discovery and security auditing
- **iftop** - Interface bandwidth usage
- **nload** - Network traffic monitoring
- **speedtest-cli** - Internet speed testing

### Security Tools
- **fail2ban** - Automatic IP blocking for failed login attempts
- **ufw** - Firewall configuration tool
- **rkhunter** - Rootkit detection
- **chkrootkit** - Rootkit checker
- **lynis** - Security auditing tool
- **ssl-cert** - SSL certificate management

### System Monitoring
- **htop** - Enhanced top command
- **iotop** - I/O usage monitoring
- **nethogs** - Per-process network usage
- **iftop** - Network interface monitoring
- **nload** - Network load monitoring
- **ncdu** - Disk usage analyzer
- **dstat** - System resource statistics
- **sysstat** - System performance tools
- **glances** - System monitoring dashboard

## 🚀 Application Runtime

### Node.js Ecosystem
- **Node.js LTS** (Latest stable version)
  - JavaScript runtime for server-side applications
  - Version: Automatically installs latest LTS
- **npm** - Node Package Manager (comes with Node.js)
- **Yarn** - Alternative package manager
  - Faster and more reliable than npm
  - Version: Latest stable

### Container Platform
- **Docker Engine** - Container runtime
  - Version: Latest stable (24.x+)
  - Components:
    - docker-ce (Community Edition)
    - docker-ce-cli (Command line interface)
    - containerd.io (Container runtime)
    - docker-buildx-plugin (Build extensions)
    - docker-compose-plugin (Compose plugin)

- **Docker Compose** - Multi-container orchestration
  - Version: Latest stable (2.20+)
  - Installed as standalone binary

### Web Server
- **Nginx** - High-performance web server
  - Version: Latest stable from Ubuntu repositories
  - Used as reverse proxy for the application
  - Handles SSL termination and static files

### SSL/TLS
- **Certbot** - Let's Encrypt certificate management
  - python3-certbot-nginx - Nginx integration
  - Automatic SSL certificate installation and renewal

### Database Tools
- **MongoDB Shell (mongosh)** - Database command line interface
  - Latest version from official MongoDB repository
  - Used for database administration and backup
- **mongodb-clients** - MongoDB client utilities
- **jq** - JSON processor for scripts
- **xmlstarlet** - XML processor

## 🛠️ Development & Management Tools

### Programming Languages
- **Python 3** - For system scripts and tools
- **Python 3 pip** - Python package installer
- **Python 3 venv** - Virtual environment support
- **Python 3 dev** - Development headers

### Build Tools
- **make** - Build automation tool
- **gcc** - GNU Compiler Collection
- **g++** - GNU C++ compiler
- **libc6-dev** - Development libraries
- **pkg-config** - Package configuration tool

### Python Packages (via pip)
- **docker-compose** - Python version of Docker Compose
- **httpie** - HTTP client for testing APIs
- **speedtest-cli** - Internet speed testing
- **glances** - System monitoring
- **psutil** - System information library

### Additional Database Tools
- **redis-tools** - Redis command line tools (for future caching needs)

## 🗂️ Log Management
- **logrotate** - Automatic log rotation
- **rsyslog** - System logging daemon
- **logwatch** - Log analysis and reporting

## 💾 Backup & Archive Tools
- **rsync** - Efficient file copying and synchronization
- **duplicity** - Encrypted backup tool
- **borgbackup** - Deduplicating backup program
- **p7zip-full** - 7-Zip archiver
- **pigz** - Parallel gzip compression

## 🐳 Docker Images

### Application Images
- **mongo:7.0** - MongoDB database server
  - Size: ~400MB
  - Official MongoDB Docker image
  - Configured with authentication and optimization

- **node:18-alpine** - Node.js runtime (for building the app)
  - Size: ~40MB (base Alpine image)
  - Used for building the Next.js application

### Custom Application Image
- **SADA App Image** - Built from Dockerfile
  - Base: node:18-alpine
  - Size: ~200-300MB (after build)
  - Contains the compiled Next.js application

## 📊 Resource Usage Summary

### Disk Space Requirements
- **System packages**: ~500MB
- **Docker installation**: ~200MB
- **Node.js & Yarn**: ~100MB
- **Application code**: ~50MB
- **MongoDB data**: Variable (starts ~50MB)
- **Docker images**: ~700MB
- **Logs and temp files**: ~100MB
- **Total**: ~1.7GB (initial installation)

### Memory Usage (Runtime)
- **System services**: ~150MB
- **Docker daemon**: ~50MB
- **MongoDB**: ~200-300MB
- **Node.js application**: ~300-400MB
- **Nginx**: ~10MB
- **Total**: ~710-910MB (leaving 100-300MB free on 1GB VPS)

## 🔒 Security Features Installed

### Firewall & Intrusion Prevention
- **UFW** - Simple firewall interface
- **fail2ban** - Automatic IP blocking
- **iptables** - Advanced firewall rules (via UFW)

### SSL/TLS Security
- **Let's Encrypt certificates** - Free SSL certificates
- **Automatic certificate renewal** - Via cron jobs
- **Perfect Forward Secrecy** - Modern cipher suites

### System Security
- **Non-root Docker containers** - Security best practice
- **File permission management** - Proper ownership and permissions
- **Log monitoring** - Security event logging
- **Regular security updates** - Automated via unattended-upgrades (optional)

## 🚀 Performance Optimizations

### System-Level Optimizations
- **Swap file configuration** - 1GB swap for memory management
- **Kernel parameter tuning** - Memory and network optimization
- **File descriptor limits** - Increased for better performance
- **Docker daemon optimization** - Memory and CPU efficiency

### Application Optimizations
- **MongoDB cache limiting** - Prevent memory exhaustion
- **Node.js heap limiting** - Optimal memory usage
- **Nginx compression** - Reduced bandwidth usage
- **Log rotation** - Prevent disk space issues

## 📝 Configuration Files Created

### System Configuration
- `/etc/docker/daemon.json` - Docker daemon optimization
- `/etc/nginx/sites-available/sada` - Nginx virtual host
- `/etc/fail2ban/jail.d/custom.conf` - Intrusion prevention rules
- `/etc/logrotate.d/sada` - Log rotation configuration
- `/etc/security/limits.conf` - System resource limits
- `/etc/sysctl.conf` - Kernel parameter optimization

### Application Configuration
- `.env.production` - Environment variables
- `docker-compose.production.yml` - Container orchestration
- `mongo-init.js` - Database initialization script

### Management Scripts
- `monitor-sada.sh` - System monitoring script
- `backup-sada.sh` - Automated backup script
- `deploy-sada-production.sh` - Main deployment script
- `quick-deploy.sh` - Quick deployment script
- `pre-deployment-check.sh` - System readiness check

## 🔄 Automated Tasks (Cron Jobs)

### Daily Tasks
- **2:00 AM** - Database and file backup
- **9:00 AM** - System health monitoring report
- **12:00 PM** - SSL certificate renewal check

### Log Management
- **Daily** - Application log rotation
- **Weekly** - System log cleanup
- **Monthly** - Old backup cleanup (7-day retention)

## 🌐 Network Ports Used

### Open to Internet
- **80** - HTTP (Nginx)
- **443** - HTTPS (Nginx with SSL)

### Localhost Only
- **3000** - Next.js application
- **27017** - MongoDB database

### SSH Access
- **22** - SSH (should be configured by user)

## 📚 Documentation & Support

All installed software comes with comprehensive documentation:
- Docker: https://docs.docker.com/
- MongoDB: https://docs.mongodb.com/
- Nginx: https://nginx.org/en/docs/
- Node.js: https://nodejs.org/en/docs/
- Let's Encrypt: https://certbot.eff.org/docs/

## 🔍 Verification Commands

After installation, verify components with these commands:

```bash
# Check versions
docker --version
docker-compose --version
node --version
npm --version
yarn --version
nginx -v
mongosh --version

# Check services
sudo systemctl status docker
sudo systemctl status nginx
sudo systemctl status fail2ban

# Check application
docker-compose -f docker-compose.production.yml ps
curl http://localhost:3000

# Check system resources
free -h
df -h
docker stats --no-stream
```

---

**Note**: This list represents the comprehensive installation performed by the full deployment script. The quick deployment script installs a subset of these components focusing on essential functionality only.