# 🏫 Sada - School Management System
**سیستەمی بەڕێوبردنی قوتابخانەی سەدا**

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite)](https://sqlite.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://docker.com/)

**🌟 Bilingual (Kurdish/English) school management system with 23+ modules for comprehensive educational administration.**

**🎯 Designed for schools and educational institutions across Kurdistan Region and beyond.**

</div>

---

> ⚡ **IMPORTANT**: This project requires **Node.js 20.x or higher**. See [Node.js 20 Requirements](#-nodejs-20-requirements) section for installation instructions.

---

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended) 🐳

**🚀 Super Quick Setup (1 minute):**

```bash
# Clone the repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# One command to setup everything!
./quick-setup.sh
```

**🔧 Complete Setup (with options):**

```bash
# Full interactive setup (checks prerequisites, builds, deploys)
./docker-setup.sh

# Or manual approach
docker-compose up -d app
```

**📱 Management:**

```bash
# Interactive management menu
./docker-start.sh

# Health check
./docker-health-check.sh

# Verify configuration
./docker-verify.sh
```

**Access the application:**
- URL: http://localhost:3000
- Default Login: `berdoz` / `berdoz@code`

📖 **Detailed guides:**
- [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Complete deployment guide
- [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md) - Command reference

### Option 2: Local Development

**Prerequisites:**
- **Node.js** 20.x or higher ⚡ (Required)
- **Yarn** 1.22+ package manager
- **SQLite** (included with better-sqlite3)

> 🔔 **Important**: Node.js 20 is required for proper compilation of native modules (better-sqlite3)

```bash
# Clone the repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# Verify Node version (must be 20.x)
node --version  # Should output: v20.x.x

# Install dependencies
yarn install

# Start development server
yarn dev
```

**Using nvm (recommended):**
```bash
# Install and use Node 20
nvm install 20
nvm use 20

# Install dependencies
yarn install
yarn dev
```

### Access the Application
- **Application URL**: http://localhost:3000
- **Default Login**: 
  - Username: `berdoz`
  - Password: `berdoz@code`
- **Database**: Automatically created at `database/sada.db`

> ⚠️ **Important**: Change default credentials in production

---

## ✨ Features Overview

### 🌐 Core Capabilities
- ✅ **Bilingual Interface**: Complete Kurdish (Sorani) and English support
- ✅ **23+ Modules**: Comprehensive school management modules
- ✅ **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ✅ **SQLite Database**: Lightweight, fast, and zero-configuration database
- ✅ **Advanced Search**: Fuzzy search across all modules
- ✅ **Export Systems**: Excel/PDF generation for reports
- ✅ **Backup & Restore**: Complete database backup and restore functionality

### 🏫 Academic Management
- 👨‍🏫 **Teacher Records** - Comprehensive teacher profiles and performance tracking
- 👨‍🎓 **Student Management** - Student records, permissions, and supervision
- 📅 **Calendar & Scheduling** - Academic calendar and event management
- 🎯 **Activities & Events** - Track school activities with media support
- 📝 **Exam Supervision** - Monitor and record exam administration

### 💰 Financial Management
- 💵 **Payroll Processing** - Employee salary calculations and tracking
- 💳 **Fee Collection** - Student fees and installment management
- 📊 **Daily Accounts** - Daily financial transactions tracking
- 🏢 **Building Expenses** - Facility maintenance and expense tracking
- 🍽️ **Kitchen Expenses** - Food service cost management
- 📈 **Monthly Expenses** - Comprehensive monthly financial reports

### 👥 Staff & Administration
- 👔 **Staff Records** - Complete HR management and documentation
- 🏖️ **Leave Management** - Employee and officer leave tracking
- 🚌 **Bus Management** - Transportation fleet and driver management
- 🔍 **Supervision & Monitoring** - Quality assurance and oversight
- 📊 **Reports & Analytics** - Comprehensive reporting across all modules

### 🔐 User & System Management
- 👤 **User Profiles** - Complete profile management with avatar support
- 🔑 **Password Management** - Secure password change functionality
- 🔒 **Security Logging** - Track all security-related events
- 💾 **Backup & Restore** - Full system backup with file uploads
- 📧 **Email Integration** - Automated email notifications and tasks

---

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | Next.js | 14.2.3 | React framework with App Router |
| | React | 18 | UI component library |
| | Tailwind CSS | 3.4+ | Utility-first CSS framework |
| | Radix UI | Latest | Accessible component primitives |
| | TanStack Table | 8.21+ | Powerful data tables |
| **Backend** | Next.js API Routes | 14.2.3 | Serverless API endpoints |
| | SQLite | 3.x | Embedded relational database |
| | better-sqlite3 | 12.4+ | Fast SQLite driver for Node.js |
| **File Handling** | Multer | 2.0+ | Multipart/form-data file uploads |
| | Archiver | 7.0+ | Backup archive creation |
| **UI Components** | Shadcn UI | Latest | Pre-built accessible components |
| | Lucide React | 0.516+ | Beautiful icon library |
| | Recharts | 2.15+ | Charting library |
| **Utilities** | date-fns | 4.1+ | Modern date utility library |
| | jsPDF | 3.0+ | PDF generation |
| | XLSX | 0.18+ | Excel file handling |
| | UUID | 9.0+ | Unique identifier generation |
| **Infrastructure** | Docker | Latest | Containerization (optional) |
| | Node.js | 20.x+ | JavaScript runtime (Required) |

---

## 📁 Project Structure

```
sada/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── profile/             # User profile endpoints
│   │   ├── backup/              # Backup functionality
│   │   ├── restore/             # Restore functionality
│   │   └── [modules]/           # 23+ module endpoints
│   ├── components/              # React components
│   └── [pages]/                 # Application pages
├── components/                   # Shared UI components
│   ├── ui/                      # Base UI components (Shadcn)
│   └── [feature-components]/   # Feature-specific components
├── lib/                         # Utility libraries
│   ├── sqlite.js               # SQLite database wrapper
│   └── mongodb.js              # MongoDB compatibility layer
├── database/                    # Database storage
│   └── sada.db                 # SQLite database file
├── public/                      # Static assets
│   └── upload/                 # User uploaded files
│       └── avatars/            # User profile avatars
├── hooks/                       # Custom React hooks
├── package.json                 # Dependencies and scripts
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── README.md                   # This file
```

---

## 💾 Database Architecture

### SQLite Database (sada.db)

The system uses **SQLite** as its database, providing:
- ✅ **Zero Configuration**: No database server setup required
- ✅ **Portability**: Single file database (database/sada.db)
- ✅ **Performance**: Fast read/write operations
- ✅ **Reliability**: ACID compliance with WAL mode
- ✅ **Easy Backup**: Simple file-based backup and restore

### Database Tables (23 Collections)

1. **Academic Module**
   - `teachers` - Teacher records
   - `teacher_info` - Additional teacher information
   - `staff_records` - Staff member details
   - `exam_supervision` - Exam monitoring
   - `supervision` - Quality supervision records

2. **Student Management**
   - `student_permissions` - Student leave permissions
   - `supervised_students` - Student supervision tracking

3. **Financial Module**
   - `payroll` - Salary and payroll data
   - `installments` - Fee installments
   - `monthly_expenses` - Monthly expenditures
   - `building_expenses` - Building maintenance costs
   - `daily_accounts` - Daily financial transactions
   - `kitchen_expenses` - Food service expenses

4. **Administrative**
   - `employee_leaves` - Employee leave records
   - `officer_leaves` - Officer leave tracking
   - `calendar_entries` - Academic calendar
   - `activities` - School activities and events
   - `bus_records` - Transportation management

5. **System & Configuration**
   - `user_profiles` - User account profiles
   - `security_logs` - Security event logging
   - `email_settings` - Email configuration
   - `email_tasks` - Scheduled email tasks
   - `legend_entries` - System legends and labels

---

## 🔧 Available Scripts

```bash
# Development
yarn dev                    # Start development server (port 3000)
yarn dev:smart             # Start with smart port detection
yarn dev:preload           # Start with data preloading

# Production
yarn build                 # Build for production
yarn start                 # Start production server

# Utilities
yarn preload-only          # Preload data only
```

---

## 🚀 Deployment

### 🐳 Docker Deployment (Recommended)

**Production Deployment:**
```bash
# Interactive deployment script
./docker-start.sh

# Or use docker-compose directly
docker-compose up -d app

# Check health
./docker-health-check.sh

# View logs
docker-compose logs -f app
```

**Development with Hot Reload:**
```bash
# Start development container
docker-compose --profile dev up -d app-dev

# Access at http://localhost:3001
docker-compose logs -f app-dev
```

**Useful Docker Commands:**
```bash
# Backup database
docker cp sada_app:/app/database/sada.db ./backup-$(date +%Y%m%d).db

# Restore database
docker cp ./backup.db sada_app:/app/database/sada.db
docker-compose restart app

# Health check
docker-compose ps
./docker-health-check.sh -v

# Stop and remove
docker-compose down
```

📖 **Complete Docker guide:** [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)

### 💻 Local Development

```bash
# Clone and setup
git clone https://github.com/bazhdarrzgar/sada.git
cd sada
yarn install

# Start development server
yarn dev
```

### 🏭 Production Deployment (Node.js)

```bash
# Build production bundle
yarn build

# Start production server
yarn start
```

---

## 💾 Backup & Restore

### Creating a Backup

**Via API:**
```bash
# Download complete backup (includes database + files)
curl http://localhost:3000/api/backup -o backup.zip
```

**Via UI:**
Navigate to Settings → Backup & Restore → Create Backup

**Backup includes:**
- ✅ Complete SQLite database (all 23 tables)
- ✅ All uploaded files (avatars, documents, images)
- ✅ System configuration files
- ✅ Backup metadata with timestamp

### Restoring from Backup

**Via API:**
```bash
# Restore from backup file
curl -X POST http://localhost:3000/api/restore \
  -F "backupFile=@backup.zip"
```

**Via UI:**
Navigate to Settings → Backup & Restore → Upload and Restore

> ⚠️ **Warning**: Restoring will replace all existing data!

---

## ⚡ Node.js 20 Requirements

### Why Node.js 20?

This project **requires Node.js 20.x or higher** for the following reasons:

- ✅ **Better-sqlite3 Compatibility**: Native module requires Node 20 for proper compilation
- ✅ **Performance**: Improved V8 engine performance
- ✅ **Next.js 14.2.3**: Optimized for Node 20 features
- ✅ **Long-term Support**: Node 20 is an LTS version with extended support
- ✅ **Security**: Latest security patches and updates

### Installation Methods

#### Using nvm (Recommended)
```bash
# Install nvm if not installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should output: v20.x.x
```

#### Using nodenv
```bash
nodenv install 20.0.0
nodenv local 20.0.0
```

#### Using n
```bash
npm install -g n
n 20
```

#### Direct Download
Download Node.js 20 LTS from [nodejs.org](https://nodejs.org/)

### Version Files

The project includes version specification files:
- `.nvmrc` - For nvm users (contains `20`)
- `.node-version` - For nodenv/n users (contains `20.0.0`)
- `package.json` - Enforces version via engines field

### Verification

```bash
# Check Node version
node --version  # Must be v20.x.x

# Check npm/yarn version
npm --version
yarn --version

# Verify better-sqlite3 compilation
npm list better-sqlite3
```

### Troubleshooting Node Version Issues

**If you have wrong Node version:**
```bash
# Remove old node_modules
rm -rf node_modules yarn.lock

# Switch to Node 20
nvm use 20

# Reinstall dependencies
yarn install
```

**If better-sqlite3 fails to compile:**
```bash
# Rebuild the module
npm rebuild better-sqlite3

# Or reinstall
npm install better-sqlite3 --build-from-source
```

---

## 🐳 Docker Deployment Updates

### Docker Build Fixes (Node 20)

All Dockerfiles have been updated to use **Node.js 20** and include proper native module compilation:

#### Available Dockerfiles

1. **Dockerfile** (Production - Debian-based)
   - Uses: `node:20-slim`
   - Best for: Production deployments
   - Features: Optimized for better-sqlite3

2. **Dockerfile.simple** (Production - Alpine-based)
   - Uses: `node:20-alpine`
   - Best for: Smaller image size
   - Features: Lightweight production build

3. **Dockerfile.dev** (Development)
   - Uses: `node:20-alpine`
   - Best for: Local development with hot reload
   - Features: Volume mounting for live changes

4. **Dockerfile.improved** (Production - Enhanced)
   - Uses: `node:20-alpine`
   - Best for: Advanced production setups
   - Features: Comprehensive build tools

### Docker Build Commands

```bash
# Build with default Dockerfile (recommended)
docker build --no-cache -t sada-app .
docker run -p 3000:3000 sada-app

# Build with simple Dockerfile (smaller size)
docker build --no-cache -f Dockerfile.simple -t sada-app .

# Build with docker-compose (easiest)
docker-compose build --no-cache
docker-compose up -d

# Development build
docker-compose --profile dev up -d app-dev
```

### Docker Deployment Checklist

Before deploying with Docker:

- ✅ Ensure you're using Node 20 based Dockerfiles
- ✅ Run `docker-compose build --no-cache` for clean builds
- ✅ Verify better-sqlite3 compilation in build logs
- ✅ Check health status: `docker-compose ps`
- ✅ View logs: `docker-compose logs -f app`

### Common Docker Issues

**better-sqlite3 compilation error:**
```bash
# Rebuild with no cache (forces recompilation)
docker-compose build --no-cache
docker-compose up -d
```

**Node version mismatch:**
```bash
# Verify Dockerfile uses node:20
grep "FROM node:" Dockerfile

# Should output: FROM node:20-slim AS base
```

**Module not found in container:**
```bash
# Rebuild dependencies in container
docker-compose exec app npm rebuild better-sqlite3
docker-compose restart app
```

---

## 🔧 Common Issues & Solutions

### Database Issues

```bash
# Database locked error
# Ensure no other process is accessing the database
pkill -f "next dev"
rm -f database/sada.db-shm database/sada.db-wal
yarn dev

# Database not found
# Database will be automatically created on first run
yarn dev
```

### File Upload Problems

```bash
# Fix upload directory permissions
chmod -R 755 public/upload/
mkdir -p public/upload/avatars
```

### Port Conflicts

```bash
# Use smart port detection
yarn dev:smart

# Or kill process using port 3000
kill -9 $(lsof -t -i:3000)

# Or use different port
PORT=3001 yarn dev
```

### Module Not Found Errors

```bash
# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# If better-sqlite3 specific error
npm rebuild better-sqlite3

# Complete rebuild
rm -rf node_modules yarn.lock
nvm use 20  # Ensure Node 20
yarn install
```

### Docker Issues

```bash
# Restart Docker services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

---

## 🔒 Security Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👤 **Role-based Access** - User permission management
- 🛡️ **Input Validation** - Comprehensive data validation
- 📁 **File Upload Security** - Type and size validation for uploads
- 🔒 **XSS Protection** - Cross-site scripting prevention
- 🛡️ **CSRF Protection** - Cross-site request forgery protection
- 📊 **SQL Injection Prevention** - Parameterized queries
- 🔑 **Password Security** - Secure password hashing (implement in production)
- 📝 **Security Logging** - Comprehensive audit trail
- 🔐 **HTTPS Ready** - SSL/TLS support

> ⚠️ **Production Checklist:**
> - [ ] Change default credentials
> - [ ] Implement password hashing (bcrypt/argon2)
> - [ ] Enable HTTPS
> - [ ] Set up regular backups
> - [ ] Configure environment variables
> - [ ] Review and update security settings

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Development Setup

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR-USERNAME/sada.git
cd sada

# Ensure Node 20 is active
node --version  # Must be v20.x.x

# Install dependencies
yarn install

# Create a feature branch
git checkout -b feature/amazing-feature

# Start development server
yarn dev

# Make your changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push to your fork
git push origin feature/amazing-feature

# Open a Pull Request on GitHub
```

### Contribution Guidelines

- 🐛 **Bug Fixes**: Identify and fix existing issues
- ✨ **New Features**: Add new functionality or modules
- 🌐 **Localization**: Add support for additional languages
- 📖 **Documentation**: Improve guides, API docs, and README
- 🎨 **UI/UX**: Enhance user interface and experience
- ⚡ **Performance**: Optimize code and improve speed
- 🧪 **Testing**: Add tests for better code coverage

### Commit Message Standards

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add student attendance module
fix: resolve login authentication issue
docs: update API documentation
style: format code with prettier
refactor: restructure database queries
perf: optimize image loading
test: add unit tests for profile module
chore: update dependencies
```

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 Bazhdar Rzgar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**What this means:**
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ❌ No liability
- ❌ No warranty

---

## 📚 Documentation Files

Additional documentation is available:

| File | Description |
|------|-------------|
| 📄 [NODE_VERSION.md](./NODE_VERSION.md) | Complete Node.js 20 requirements and setup guide |
| 🐳 [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) | Detailed Docker deployment instructions |
| ⚡ [DOCKER_QUICK_REFERENCE.md](./DOCKER_QUICK_REFERENCE.md) | Quick Docker commands reference |

---

## 📞 Support & Contact

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| 🐛 **[GitHub Issues](https://github.com/bazhdarrzgar/sada/issues)** | Bug reports, feature requests | 24-48 hours |
| 💬 **[GitHub Discussions](https://github.com/bazhdarrzgar/sada/discussions)** | Questions, ideas, help | 1-3 days |
| 📧 **Email** | bazhdar.rzgar@gmail.com | 2-5 days |
| 📖 **Documentation** | In-code docs and README | N/A |

---

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 1 GHz processor
- **RAM**: 2 GB
- **Storage**: 500 MB free space
- **Node.js**: 20.0 or higher ⚡ (Required)
- **Yarn**: 1.22 or higher
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

### Recommended Requirements
- **CPU**: 2 GHz multi-core processor
- **RAM**: 4 GB or more
- **Storage**: 2 GB free space
- **Node.js**: 20.x LTS (Latest)
- **Yarn**: Latest version
- **Browser**: Latest version of Chrome or Firefox

---

## 🌍 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest 2 versions | ✅ Fully Supported |
| Firefox | Latest 2 versions | ✅ Fully Supported |
| Safari | Latest 2 versions | ✅ Fully Supported |
| Edge | Latest 2 versions | ✅ Fully Supported |
| Opera | Latest version | ✅ Fully Supported |
| IE 11 | N/A | ❌ Not Supported |

---

## 📈 Roadmap

### Current Version (v1.0.0)
- ✅ 23+ management modules
- ✅ SQLite database integration
- ✅ Bilingual support (Kurdish/English)
- ✅ Backup and restore functionality
- ✅ File upload system
- ✅ PDF/Excel export

### Upcoming Features
- 🔄 Multi-user authentication system
- 📱 Mobile application (React Native)
- 📊 Advanced analytics dashboard
- 🔔 Real-time notifications
- 📧 Enhanced email automation
- 🌐 Additional language support (Arabic, Turkish)
- 📱 Progressive Web App (PWA)
- 🔒 Enhanced security features
- 📚 API documentation with Swagger
- 🧪 Automated testing suite

---

<div align="center">

## 🚀 Quick Commands Reference

### Verify Prerequisites
```bash
# Check Node version (must be 20.x)
node --version

# Install Node 20 with nvm
nvm install 20 && nvm use 20
```

### Installation
```bash
git clone https://github.com/bazhdarrzgar/sada.git && cd sada && yarn install && yarn dev
```

### Docker Deployment
```bash
./docker-setup-with-permissions.sh
```

### Backup & Restore
```bash
# Create backup
curl http://localhost:3000/api/backup -o backup.zip

# Restore backup
curl -X POST http://localhost:3000/api/restore -F "backupFile=@backup.zip"
```

---

## 🌟 Key Features

✅ **23+ Modules** • ✅ **SQLite Database** • ✅ **Bilingual Interface** • ✅ **Mobile Responsive**  
✅ **Backup & Restore** • ✅ **Secure Authentication** • ✅ **File Management** • ✅ **Export to Excel/PDF**

---

## 🎯 Perfect For

🏫 **Schools** • 📚 **Educational Institutions** • 👨‍🏫 **Training Centers**  
🏛️ **Government Education** • 🎓 **Universities** • 👶 **Kindergartens**

---

## 💝 Built With Love

**Built with 💝 for Educational Excellence**  
**دروستکراوە لەگەڵ 💝 بۆ باشبوونی پەروەردەیی**

*Empowering education across Kurdistan Region and beyond*

---

[![GitHub Stars](https://img.shields.io/github/stars/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada)
[![GitHub Forks](https://img.shields.io/github/forks/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada/fork)
[![GitHub Issues](https://img.shields.io/github/issues/bazhdarrzgar/sada)](https://github.com/bazhdarrzgar/sada/issues)
[![GitHub License](https://img.shields.io/github/license/bazhdarrzgar/sada)](https://github.com/bazhdarrzgar/sada/blob/main/LICENSE)

---

### ⭐ If you find this project useful, please consider giving it a star!

</div>
