# 🏫 Sada - School Management System
**سیستەمی بەڕێوبردنی قوتابخانەی سەدا**

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.6.0-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://docker.com/)

**🌟 Bilingual (Kurdish/English) school management system with 23+ modules for comprehensive educational administration.**

**🎯 Designed for schools and educational institutions across Kurdistan Region and beyond.**

</div>

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Yarn package manager
- MongoDB 6.0+ (local or Atlas)

### Installation

```bash
# Clone and install
git clone https://github.com/bazhdarrzgar/sada.git
cd sada
yarn install

# Start development server
yarn dev:smart
```

### Access the Application
- **Application**: http://localhost:3000
- **Login**: username: `berdoz` | password: `berdoz@code`

### Docker Deployment (Production)
```bash
# Quick setup
./docker-setup-with-permissions.sh

# Or manual setup
docker-compose up -d
```

---

## ✨ Features

### 🌐 Core Capabilities
- **Bilingual Interface**: Complete Kurdish (Sorani) and English support
- **23+ Modules**: Comprehensive school management modules
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live data synchronization
- **Advanced Search**: Fuzzy search across all modules
- **Export Systems**: Excel/PDF generation

### 🏫 Main Modules

**📚 Academic Management**
- Teacher Records & Performance
- Student Management & Permissions  
- Calendar & Scheduling
- Activities & Events

**💰 Financial Management**
- Payroll Processing
- Fee Collection & Installments
- Daily Accounts & Expenses
- Budget Tracking

**👥 Staff & Administration**
- Staff Records & HR
- Leave Management
- Supervision & Monitoring
- Reports & Analytics

---

## 🛠️ Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Frontend** | Next.js | 14.2.3 | React framework with App Router |
| | React | 18 | UI library |
| | Tailwind CSS | 3.4+ | Utility-first styling |
| | Radix UI | Latest | Accessible components |
| **Backend** | Node.js | 18+ | JavaScript runtime |
| | MongoDB | 6.6.0 | Document database |
| | JWT | Latest | Authentication |
| | Multer | 2.0+ | File uploads |
| **Infrastructure** | Docker | Latest | Containerization |
| | Nginx | Latest | Reverse proxy |
| | Ubuntu | 20.04+ | Server OS |

---

## 🔧 Common Issues & Solutions

### File Upload Problems
```bash
# Fix permissions
./fix-upload-permissions.sh
sudo chmod -R 755 public/upload/
```

### Port Conflicts
```bash
# Use smart port detection
yarn dev:smart

# Or kill conflicting process
kill -9 $(lsof -t -i:3000)
```

### Docker Issues
```bash
# Restart services
docker-compose restart
docker-compose logs -f
```

---

## 🔒 Security Features

- JWT Authentication with role-based access
- Input validation and sanitization
- File upload security with type validation
- XSS and CSRF protection
- MongoDB parameterized queries
- HTTPS enforcement with SSL/TLS

**Default Login**: username: `berdoz` | password: `berdoz@code`
> ⚠️ **Important**: Change default credentials in production

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
```bash
# Fork and clone your fork
git clone https://github.com/YOUR-USERNAME/sada.git
cd sada
yarn install

# Create feature branch
git checkout -b feature/amazing-feature

# Start development
yarn dev:smart
```

### Contribution Guidelines
- **🐛 Bug Fixes**: Resolve existing issues
- **✨ New Features**: Enhance school management capabilities  
- **🌐 Localization**: Add support for more languages
- **📖 Documentation**: Improve guides and API docs

### Commit Standards
Follow [Conventional Commits](https://www.conventionalcommits.org/):
```bash
feat: add student attendance module
fix: resolve login authentication issue
docs: update API documentation
```

---

## 📄 License

This project is licensed under the **MIT License**.

**License Summary:**
- ✅ Commercial use, modification, distribution, private use
- ❌ No warranty or liability, cannot use project trademarks

---

## 📞 Support & Contact

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| **🐛 [GitHub Issues](https://github.com/bazhdarrzgar/sada/issues)** | Bug reports, feature requests | 24-48 hours |
| **💬 [GitHub Discussions](https://github.com/bazhdarrzgar/sada/discussions)** | Questions, ideas | 1-3 days |
| **📧 Email** | `bazhdar.rzgar@gmail.com` | 2-5 days |

---

<div align="center">

## 🚀 Quick Commands Reference

```bash
# Installation
git clone https://github.com/bazhdarrzgar/sada.git && cd sada && yarn install && yarn dev:smart
```

```bash
# Docker Deployment  
./docker-setup-with-permissions.sh
```

```bash
# Troubleshooting
./diagnose-upload-issue.sh  # Fix upload issues
yarn dev:smart              # Smart port detection
docker-compose restart      # Restart services
```

---

### 🌟 Key Features Summary
✅ **23+ Modules** • ✅ **Bilingual Interface** • ✅ **Docker Ready** • ✅ **Mobile Responsive**  
✅ **Real-time Sync** • ✅ **Secure Authentication** • ✅ **File Management** • ✅ **Email Automation**

### 🎯 Perfect For
🏫 **Schools** • 📚 **Educational Institutions** • 👨‍🏫 **Training Centers** • 🏛️ **Government Education**

---

**Built with 💝 for Educational Excellence**  
**دروستکراوە لەگەڵ 💝 بۆ باشبوونی پەروەردەیی**

*Empowering education across Kurdistan Region and beyond*

[![GitHub Stars](https://img.shields.io/github/stars/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada)
[![GitHub Forks](https://img.shields.io/github/forks/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada/fork)

</div>