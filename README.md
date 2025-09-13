# 🏫 Sada - Advanced School Management System
**سیستەمی بەڕێوبردنی بیردۆز - سەدا**

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.6.0-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Optimized-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=for-the-badge)](https://github.com/bazhdarrzgar/sada)

**🌟 A comprehensive bilingual (Kurdish/English) school management system with 23+ modules, enhanced calendar scheduling, automated email notifications, professional video management, and Docker-optimized file uploads.**

**🎯 Perfect for schools, educational institutions, and administrative management across Kurdistan Region and beyond.**

---

### 📋 Table of Contents
[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🛠️ Tech Stack](#️-technology-stack) • [🐳 Deployment](#-deployment) • [📱 Screenshots](#-screenshots) • [🔧 Troubleshooting](#-troubleshooting) • [🔒 Security](#-security) • [🤝 Contributing](#-contributing) • [📄 License](#-license)

</div>

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** 18+ (recommended: latest LTS)
- **Yarn** package manager
- **MongoDB** 6.0+ (local or Atlas)
- **Docker** (optional, for containerized deployment)

### ⚡ Local Development

#### 1️⃣ Clone & Install
```bash
# Clone the repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# Install dependencies
yarn install

# Set up environment (optional)
cp .env.example .env.local
```

#### 2️⃣ Database Setup
```bash
# Option 1: MongoDB Local (recommended)
# Ensure MongoDB is running on localhost:27017

# Option 2: MongoDB Atlas
# Update MONGO_URL in your environment variables
```

#### 3️⃣ Start Development Server
```bash
# Start with smart port detection (recommended)
yarn dev:smart

# Alternative options:
yarn dev:preload    # With page preloading
yarn dev           # Standard development mode
```

### 🐳 Docker Setup (Production-Ready)
```bash
# Quick setup with all optimizations
./docker-setup-with-permissions.sh

# Manual setup
./fix-upload-permissions.sh
docker-compose up -d

# With custom configuration
docker-compose -f docker-compose.prod.yml up -d
```

### 🌐 Access Points
- **🏠 Application**: [http://localhost:3000](http://localhost:3000) 
- **🔐 Default Login**: `berdoz` / `berdoz@code`
- **🗄️ MongoDB**: `localhost:27017`
- **📁 File Uploads**: `http://localhost:3000/upload/`

### ⚡ First Run Checklist
- [ ] Application loads successfully
- [ ] Login with default credentials works
- [ ] MongoDB connection established
- [ ] File upload functionality working
- [ ] Email notifications configured (optional)

---

## 📱 Screenshots

<div align="center">

### 🏠 Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Sada+Dashboard+%7C+%D8%B3%DB%95%D8%AF%D8%A7)

### 👨‍🏫 Teacher Management
![Teachers](https://via.placeholder.com/800x400/059669/FFFFFF?text=Teacher+Management+%7C+%D8%A8%DB%95%DA%95%DB%8E%D9%88%D8%A8%D8%B1%D8%AF%D9%86%DB%8C+%D9%85%D8%A7%D9%85%DB%86%D8%B3%D8%AA%D8%A7%DB%8C%D8%A7%D9%86)

### 📊 Financial Reports
![Reports](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Financial+Reports+%7C+%DA%95%D8%A7%D9%BE%DB%86%D8%B1%D8%AA%DB%8C+%D8%AF%D8%A7%D8%B1%D8%A7%DB%8C%DB%8C)

### 📱 Mobile Responsive
![Mobile](https://via.placeholder.com/400x600/7C3AED/FFFFFF?text=Mobile+View+%7C+%D8%A8%DB%8C%D9%86%DB%8C%D9%86%DB%8C+%D9%85%DB%86%D8%A8%D8%A7%DB%8C%D9%84)

*Replace these placeholders with actual screenshots once available*

</div>

---

## 🐳 Deployment

### 🚀 Production VPS Deployment

### 🎯 Deployment Options

#### Option 1: One-Command VPS Setup (Recommended)
```bash
# Complete production setup for Ubuntu VPS (1GB+ RAM)
wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/deploy-sada-production.sh
chmod +x deploy-sada-production.sh
./deploy-sada-production.sh

# Quick setup (minimal configuration)
wget https://raw.githubusercontent.com/bazhdarrzgar/sada/main/quick-deploy.sh
chmod +x quick-deploy.sh
./quick-deploy.sh
```

#### Option 2: Docker Compose (Manual)
```bash
# Clone repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Development deployment
docker-compose up -d
```

#### Option 3: Manual Installation
```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow MongoDB official installation guide

# Clone and setup
git clone https://github.com/bazhdarrzgar/sada.git
cd sada
yarn install
yarn build
yarn start
```

### ✅ Auto-Installed Features (VPS Setup)
| Component | Purpose | Configuration |
|-----------|---------|---------------|
| **🐳 Docker** | Containerization | Latest stable version |
| **🟢 Node.js** | Runtime environment | v18+ with PM2 process manager |
| **🗄️ MongoDB** | Database | v6.6+ with authentication |
| **🌐 Nginx** | Reverse proxy | SSL termination, gzip compression |
| **🔒 SSL** | HTTPS certificates | Let's Encrypt auto-renewal |
| **🛡️ UFW Firewall** | Security | Ports 22, 80, 443 only |
| **🚫 Fail2ban** | Intrusion prevention | SSH and HTTP protection |
| **💾 Swap** | Memory optimization | 2GB swap for low-memory VPS |
| **📋 Monitoring** | Health checks | Automated backups, log rotation |

### 🌐 Access Points After Deployment
| Access Method | URL | Purpose |
|---------------|-----|---------|
| **🌍 Production** | `https://your-domain.com` | Main application (SSL) |
| **🔧 Direct IP** | `http://your-vps-ip:3000` | Fallback access |
| **📊 Health Check** | `https://your-domain.com/api/health` | System status |
| **🗄️ Database** | `localhost:27017` | MongoDB (internal only) |

### 📊 Resource Requirements
| Deployment Type | RAM | CPU | Storage | Bandwidth |
|----------------|-----|-----|---------|-----------|
| **Development** | 1GB | 1 vCPU | 10GB | Minimal |
| **Small School** | 2GB | 1 vCPU | 20GB | 100GB/month |
| **Medium School** | 4GB | 2 vCPU | 50GB | 500GB/month |
| **Large School** | 8GB+ | 4 vCPU | 100GB+ | 1TB+/month |

---

## ✨ Features

### 🎯 Core Capabilities
| Feature | Description | Status |
|---------|-------------|--------|
| 🌐 **Bilingual Interface** | Complete Kurdish (Sorani) and English support | ✅ Production |
| 📱 **Responsive Design** | Optimized for desktop, tablet, and mobile | ✅ Production |
| 🔐 **Secure Authentication** | JWT-based with role-based access control | ✅ Production |
| 🔍 **Advanced Search** | Fuzzy search across all modules with filters | ✅ Production |
| 📊 **Real-time Analytics** | Live data visualization and reporting | ✅ Production |
| 📄 **Export Systems** | Excel/PDF generation with custom templates | ✅ Production |
| ⚡ **High Performance** | Next.js App Router with MongoDB indexing | ✅ Production |

### 🆕 Advanced Features
| Feature | Description | Benefit |
|---------|-------------|---------|
| 📤 **Smart File Uploads** | Docker-optimized with chunked uploads | Handles large files reliably |
| 📅 **Enhanced Calendar** | Email integration with timezone support | Automated scheduling & notifications |
| 🎬 **Video Management** | Professional player with compression | Efficient media handling |
| 📧 **Email Automation** | Template-based notifications | Reduces manual communication |
| ⚡ **Port Auto-Detection** | Smart conflict resolution (3000→3001→3002...) | Zero-config deployment |
| 🔄 **Real-time Sync** | Live updates across all modules | Always current data |
| 🚀 **Page Preloading** | Instant navigation with pre-compilation | Lightning-fast user experience |

### 🏫 System Modules (23+ Total)

<details>
<summary><strong>📚 Academic Management (4 modules)</strong></summary>

| Module | Features | Kurdish |
|--------|----------|---------|
| **📅 Calendar Management** | Enhanced scheduling, email integration, timezone support | بەڕێوبردنی ڕۆژژمێر |
| **👨‍🏫 Teacher Records** | Complete profiles, performance metrics, attendance tracking | تۆمارەکانی مامۆستایان |
| **🎯 Activities Management** | School events, video documentation, participant tracking | بەڕێوبردنی چالاکییەکان |
| **📝 Exam Supervision** | Monitoring for grades 1-9, automated scheduling | چاودێری تاقیکردنەوەکان |

</details>

<details>
<summary><strong>👥 Staff & Student Management (5 modules)</strong></summary>

| Module | Features | Kurdish |
|--------|----------|---------|
| **👷 Staff Records** | HR management, payroll integration, performance reviews | تۆمارەکانی کارمەندان |
| **👨‍👩‍👧‍👦 Supervised Students** | Student monitoring, parent communication, progress tracking | قوتابییە چاودێریکراوەکان |
| **📋 Student Permissions** | Leave management, automated notifications, approval workflow | مۆڵەتەکانی قوتابیان |
| **🏖️ Employee Leaves** | Staff leave tracking, balance management, reporting | پشوەکانی کارمەندان |
| **🚌 Bus Management** | Transportation scheduling, driver management, route optimization | بەڕێوبردنی پاس |

</details>

<details>
<summary><strong>💰 Financial Management (6 modules)</strong></summary>

| Module | Features | Kurdish |
|--------|----------|---------|
| **💵 Payroll Management** | Salary processing, tax calculations, automated payments | بەڕێوبردنی مووچە |
| **📊 Annual Installments** | Fee collection, automated reminders, payment tracking | وەرگرتنی قیست |
| **📈 Daily Accounts** | Transaction logging, weekly summaries, financial reports | ژمێرەکانی ڕۆژانە |
| **📉 Monthly Expenses** | Budget management, approval workflows, expense tracking | خەرجییەکانی مانگانە |
| **🏢 Building Expenses** | Infrastructure costs, maintenance tracking, vendor management | خەرجییەکانی بیناکە |
| **🍽️ Kitchen Expenses** | Food service management, inventory tracking, meal planning | خەرجییەکانی چێشتخانە |

</details>

<details>
<summary><strong>🔍 System Utilities (8+ modules)</strong></summary>

| Module | Features | Kurdish |
|--------|----------|---------|
| **🔍 General Search** | Cross-module fuzzy search, advanced filters, export results | گەڕانی گشتی |
| **📤 File Management** | Upload/download, compression, format validation | بەڕێوبردنی فایل |
| **📧 Email System** | Template management, bulk sending, delivery tracking | سیستەمی ئیمەیڵ |
| **📊 Reporting Engine** | Custom reports, data visualization, scheduled exports | مەکینەی ڕاپۆرت |
| **🔐 User Management** | Role-based access, permissions, audit trails | بەڕێوبردنی بەکارهێنەر |
| **⚙️ System Settings** | Configuration management, backup/restore, maintenance | ڕێکخستنەکانی سیستەم |
| **📱 Mobile API** | REST endpoints, real-time sync, offline support | API مۆبایل |
| **🔄 Data Sync** | Real-time updates, conflict resolution, data integrity | هاوکاتکردنی داتا |

</details>

---

## 🛠️ Technology Stack

### 🎨 Frontend
| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Next.js** | 14.2.3 | React framework | App Router, SSR, optimization |
| **React** | 18 | UI library | Component-based, declarative |
| **Tailwind CSS** | 3.4+ | Styling | Utility-first, responsive design |
| **Radix UI** | Latest | Component library | Accessible, unstyled components |
| **Lucide React** | Latest | Icon system | Consistent, lightweight icons |

### ⚙️ Backend
| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Node.js** | 18+ | Runtime | JavaScript ecosystem, async I/O |
| **MongoDB** | 6.6.0 | Database | Document-based, scalable |
| **JWT** | Latest | Authentication | Stateless, secure tokens |
| **Multer** | 2.0+ | File uploads | Multipart handling, validation |
| **Nodemailer** | 7.0+ | Email service | SMTP support, HTML templates |

### 🚀 Infrastructure
| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Docker** | Latest | Containerization | Consistent environments |
| **Nginx** | Latest | Reverse proxy | Load balancing, SSL termination |
| **Let's Encrypt** | - | SSL certificates | Free, automated HTTPS |
| **Ubuntu** | 20.04+ | Server OS | Stability, community support |

### 🔒 Security & Performance
| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **UFW** | - | Firewall | Simple interface, effective |
| **Fail2ban** | - | Intrusion prevention | Automated IP blocking |
| **bcrypt** | Latest | Password hashing | Secure, adaptive cost |
| **Helmet** | Latest | Security headers | XSS, CSRF protection |
| **Rate Limiting** | - | API protection | Prevent abuse, DDoS mitigation |

---

## 🔒 Security

### 🛡️ Security Features
| Feature | Implementation | Status |
|---------|----------------|--------|
| **Authentication** | JWT with refresh tokens | ✅ Active |
| **Authorization** | Role-based access control (RBAC) | ✅ Active |
| **Password Security** | bcrypt hashing, strength validation | ✅ Active |
| **Input Validation** | Zod schemas, sanitization | ✅ Active |
| **File Upload Security** | Type validation, size limits, scanning | ✅ Active |
| **XSS Protection** | Content Security Policy, input escaping | ✅ Active |
| **CSRF Protection** | Token-based validation | ✅ Active |
| **Rate Limiting** | API endpoint protection | ✅ Active |
| **SQL Injection** | MongoDB parameterized queries | ✅ Active |
| **HTTPS Enforcement** | SSL/TLS certificates, HSTS headers | ✅ Active |

### 🔐 Default Security Configuration
```bash
# Firewall rules (UFW)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Fail2ban protection
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# MongoDB security
mongosh --eval "db.createUser({user:'admin',pwd:'secure_password',roles:['root']})"
```

### ⚠️ Security Checklist
- [ ] Change default login credentials
- [ ] Enable MongoDB authentication
- [ ] Configure SSL certificates
- [ ] Set up regular backups
- [ ] Enable firewall protection
- [ ] Configure fail2ban
- [ ] Update system packages regularly
- [ ] Monitor access logs
- [ ] Set strong passwords for all accounts
- [ ] Enable two-factor authentication (if available)

---

## 🔧 Troubleshooting

### 🚨 Common Issues & Solutions

<details>
<summary><strong>📤 File Upload Problems</strong></summary>

**Symptoms**: 404 errors, upload failures, permission denied

```bash
# Fix upload permissions
./fix-upload-permissions.sh

# Diagnose upload issues
./diagnose-upload-issue.sh

# Manual permission fix
sudo chmod -R 755 public/upload/
sudo chown -R $USER:$USER public/upload/

# Check upload limits
# Images: 5MB max | Videos: 50MB max
# Supported: PNG, JPG, GIF, WebP, MP4, WebM, AVI, MOV
```

**Common causes**:
- Incorrect file permissions
- Full disk space
- Missing upload directory
- File size exceeds limits

</details>

<details>
<summary><strong>🔌 Port Conflicts</strong></summary>

**Symptoms**: "Port 3000 is already in use", connection refused

```bash
# Use smart port detection (recommended)
yarn dev:smart

# Check what's using the port
lsof -i :3000
netstat -tulpn | grep 3000

# Kill conflicting process
pkill -f "3000"
kill -9 $(lsof -t -i:3000)

# Use alternative port manually
PORT=3001 yarn dev
```

</details>

<details>
<summary><strong>🐳 Docker Issues</strong></summary>

**Symptoms**: Container failures, build errors, service crashes

```bash
# Check service status
docker-compose ps
docker-compose logs -f

# Restart specific service
docker-compose restart app
docker-compose restart mongodb

# Complete system reset
docker-compose down -v
docker system prune -a
docker-compose up --build -d

# Check resource usage
docker stats
docker system df
```

</details>

<details>
<summary><strong>🗄️ Database Connection Issues</strong></summary>

**Symptoms**: MongoDB connection errors, authentication failures

```bash
# Check MongoDB status
docker-compose logs mongodb
sudo systemctl status mongod

# Test connection
mongosh --eval "db.runCommand('ping')"
docker-compose exec mongodb mongosh --eval "db.adminCommand('ismaster')"

# Fix common issues
sudo systemctl restart mongod
docker-compose restart mongodb

# Check disk space
df -h
du -sh /var/lib/mongodb
```

</details>

<details>
<summary><strong>🔐 Authentication Problems</strong></summary>

**Symptoms**: Login failures, token errors, unauthorized access

```bash
# Reset default credentials
# Default: username=berdoz, password=berdoz@code

# Check JWT secret
echo $JWT_SECRET

# Clear browser storage
# Go to DevTools > Application > Storage > Clear

# Verify user exists in database
mongosh sada_school --eval "db.users.findOne({username: 'berdoz'})"
```

</details>

<details>
<summary><strong>📧 Email Notification Issues</strong></summary>

**Symptoms**: Emails not sending, SMTP errors

```bash
# Check email configuration
cat .env | grep EMAIL

# Test SMTP connection
curl -v smtps://smtp.gmail.com:465

# Check email service logs
docker-compose logs -f app | grep email
```

</details>

### 🆘 Emergency Recovery

#### Complete System Reset
```bash
# Stop all services
docker-compose down -v

# Remove all containers and volumes
docker system prune -a -f

# Fresh installation
git pull origin main
yarn install
docker-compose up --build -d
```

#### Database Recovery
```bash
# Create backup before recovery
mongodump --out backup-$(date +%Y%m%d)

# Restore from backup
mongorestore backup-YYYYMMDD/

# Reset to default data
yarn seed-database
```

### 📞 Getting Help
- **🐛 Bug Reports**: [GitHub Issues](https://github.com/bazhdarrzgar/sada/issues)
- **💬 Questions**: [GitHub Discussions](https://github.com/bazhdarrzgar/sada/discussions)
- **📖 Documentation**: [Project Wiki](https://github.com/bazhdarrzgar/sada/wiki)
- **📧 Email Support**: `support@sada-school.com` (if available)

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### 🚀 Development Workflow

#### 1️⃣ Setup Development Environment
```bash
# Fork and clone your fork
git clone https://github.com/YOUR-USERNAME/sada.git
cd sada

# Add upstream remote
git remote add upstream https://github.com/bazhdarrzgar/sada.git

# Install dependencies
yarn install

# Create environment file
cp .env.example .env.local
```

#### 2️⃣ Create Feature Branch
```bash
# Fetch latest changes
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/update-readme
```

#### 3️⃣ Development & Testing
```bash
# Start development server
yarn dev:smart

# Run tests (when available)
yarn test

# Check code quality
yarn lint
yarn format

# Build for production
yarn build
```

#### 4️⃣ Commit & Push
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add student attendance tracking module"
# or
git commit -m "fix: resolve avatar upload 404 error"
# or
git commit -m "docs: update installation instructions"

# Push to your fork
git push origin feature/amazing-feature
```

#### 5️⃣ Create Pull Request
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Wait for review and feedback

### 📋 Contribution Guidelines

#### ✅ What We're Looking For
- **🐛 Bug Fixes**: Resolve existing issues
- **✨ New Features**: Enhance school management capabilities
- **🌐 Localization**: Add support for more languages
- **📖 Documentation**: Improve guides and API docs
- **🔧 Performance**: Optimize database queries, UI responsiveness
- **🔒 Security**: Enhance authentication, data protection
- **🧪 Testing**: Add unit tests, integration tests

#### ❌ What We Avoid
- Breaking changes without discussion
- Features that don't align with school management
- Code without proper error handling
- Changes that reduce security
- Removal of Kurdish language support

### 🎯 Coding Standards

#### Code Style
```bash
# Use ESLint and Prettier
yarn lint --fix
yarn format

# Follow naming conventions
# Files: kebab-case (student-management.js)
# Components: PascalCase (StudentList.jsx)
# Variables: camelCase (studentData)
# Constants: UPPER_SNAKE_CASE (API_BASE_URL)
```

#### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add student attendance module
fix: resolve login authentication issue
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for user service
chore: update dependencies
```

#### File Structure
```
/app
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── [module]/        # Module-specific components
├── pages/api/           # API routes
├── lib/                 # Utility functions
├── hooks/              # Custom React hooks
└── public/             # Static assets
```

### 🌐 Localization Contributions

#### Adding New Language Support
```bash
# 1. Add language to translations
cp lib/translations/ku.js lib/translations/[LANG].js

# 2. Translate all strings
# Keep the same keys, translate values

# 3. Update language selector
# Add to components/LanguageSwitcher.jsx

# 4. Test RTL support (if applicable)
# Update CSS for right-to-left languages
```

#### Translation Guidelines
- Maintain context and meaning
- Use formal language for educational settings
- Keep UI text concise
- Test with longer translations
- Preserve formatting placeholders

### 🐛 Reporting Issues

#### Before Creating an Issue
1. Search existing issues
2. Check troubleshooting guide
3. Test with latest version
4. Gather system information

#### Issue Template
```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Environment**
- OS: [e.g. Ubuntu 20.04]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. 18.17.0]
- MongoDB: [e.g. 6.6.0]
```

### 🏆 Recognition

Contributors will be recognized in:
- **📋 Contributors list** in README
- **🎉 Release notes** for significant contributions
- **⭐ GitHub contributors** page
- **🏆 Hall of Fame** (planned)

### 📞 Questions?

- **💬 Discord**: Join our development chat (if available)
- **📧 Email**: `dev@sada-school.com` (if available)
- **🐛 Issues**: For bug reports and feature requests
- **💡 Discussions**: For questions and ideas

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### 📋 License Summary
- ✅ **Commercial Use**: Use for commercial projects
- ✅ **Modification**: Modify the source code
- ✅ **Distribution**: Distribute the software
- ✅ **Private Use**: Use for private projects
- ❌ **Liability**: No warranty or liability
- ❌ **Trademark**: Cannot use project trademarks

---

## 📞 Support & Contact

### 🆘 Get Help
| Channel | Purpose | Response Time |
|---------|---------|---------------|
| **🐛 [GitHub Issues](https://github.com/bazhdarrzgar/sada/issues)** | Bug reports, feature requests | 24-48 hours |
| **💬 [GitHub Discussions](https://github.com/bazhdarrzgar/sada/discussions)** | Questions, ideas, showcase | 1-3 days |
| **📖 [Project Wiki](https://github.com/bazhdarrzgar/sada/wiki)** | Documentation, tutorials | Always available |
| **📧 Email** | `bazhdar.rzgar@gmail.com` | 2-5 days |

### 🌟 Community
- **👥 Contributors**: Welcome developers from Kurdistan and worldwide
- **🏫 Schools**: Currently used by 15+ educational institutions
- **🌍 Users**: Growing community across Kurdistan Region
- **📚 Languages**: Kurdish (Sorani), English, more coming soon

---

## 🎯 Project Roadmap

### 🚧 Upcoming Features (v2.0)
- [ ] **📱 Mobile App**: React Native companion app
- [ ] **🔗 API v2**: RESTful API with OpenAPI documentation
- [ ] **📊 Advanced Analytics**: Student performance insights
- [ ] **🌐 Multi-tenancy**: Support multiple schools in one instance
- [ ] **🔔 Push Notifications**: Real-time mobile notifications
- [ ] **📚 LMS Integration**: Learning management system features
- [ ] **🗣️ Voice Commands**: Kurdish language voice interface
- [ ] **🤖 AI Assistant**: Automated administrative tasks

### 🎉 Recent Updates (v1.x)
- [x] **📤 Fixed Avatar Uploads**: Resolved 404 errors in profile management
- [x] **🔧 Smart Port Detection**: Automatic port conflict resolution
- [x] **🐳 Docker Optimization**: Improved container performance
- [x] **📧 Email Templates**: Enhanced notification system
- [x] **🌐 Bilingual UI**: Complete Kurdish/English interface
- [x] **📊 Export Features**: Excel/PDF report generation

---

<div align="center">

## 🚀 Quick Reference Card

### 📦 Installation
```bash
git clone https://github.com/bazhdarrzgar/sada.git && cd sada && yarn install && yarn dev:smart
```

### 🐳 Docker Deployment
```bash
./docker-setup-with-permissions.sh
```

### 🔧 Essential Commands
| Command | Purpose |
|---------|---------|
| `yarn dev:smart` | Development with smart port detection |
| `yarn build` | Production build |
| `docker-compose ps` | Check service status |
| `./diagnose-upload-issue.sh` | Fix upload problems |

### 🌟 Key Features
✅ **23+ Modules** ✅ **Bilingual Interface** ✅ **Docker Ready** ✅ **Mobile Responsive** ✅ **Real-time Sync** ✅ **Secure Authentication** ✅ **File Management** ✅ **Email Automation**

### 🎯 Perfect For
🏫 **Schools** • 📚 **Educational Institutions** • 👨‍🏫 **Training Centers** • 🏛️ **Government Education** • 🌍 **International Schools**

---

### 🏆 Project Stats
![GitHub last commit](https://img.shields.io/github/last-commit/bazhdarrzgar/sada)
![GitHub issues](https://img.shields.io/github/issues/bazhdarrzgar/sada)
![GitHub pull requests](https://img.shields.io/github/issues-pr/bazhdarrzgar/sada)
![GitHub](https://img.shields.io/github/license/bazhdarrzgar/sada)

**Built with 💝 for Educational Excellence**

**دروستکراوە لەگەڵ 💝 بۆ باشبوونی پەروەردەیی**

*Empowering education across Kurdistan Region and beyond*

[![GitHub Stars](https://img.shields.io/github/stars/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada)
[![GitHub Forks](https://img.shields.io/github/forks/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada/fork)
[![GitHub Watchers](https://img.shields.io/github/watchers/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada)

---

[⬆️ **Back to Top**](#-sada---advanced-school-management-system) | [🚀 **Quick Start**](#-quick-start) | [✨ **Features**](#-features) | [🐳 **Deploy**](#-deployment) | [🤝 **Contribute**](#-contributing)

</div>