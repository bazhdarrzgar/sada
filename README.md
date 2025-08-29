# 🏫 Sada - School Management System
**سیستەمی بەڕێوەبردنی بەردۆز - سەدا**

A comprehensive bilingual (Kurdish/English) school management system with 17+ modules, enhanced calendar scheduling, and automated email notifications.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.6.0-green?style=flat&logo=mongodb)](https://mongodb.com/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker)](https://docker.com/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen?style=flat)](https://github.com/bazhdarrzgar/sada)

---

## 🚀 Quick Start

```bash
# 🐳 Docker (Recommended)
git clone https://github.com/bazhdarrzgar/sada.git
cd sada && docker-compose up -d

# 🛠️ Local Development
yarn install && yarn dev

# 🌐 Access: http://localhost:3000
# 🔐 Login: berdoz / berdoz@code
```

## ✨ Key Features

**🎯 Core Capabilities**
- 🇰🇺 **Bilingual Interface**: Kurdish (Sorani) and English support
- 📱 **Responsive Design**: Desktop, tablet, and mobile optimized
- 🔐 **Secure Authentication**: Session-based with localStorage persistence
- 🔍 **Smart Search**: Fuzzy search across all modules (Fuse.js)
- 📊 **Real-time Analytics**: Automatic calculations and validation
- 📄 **Export Options**: Excel/PDF generation for all data

**🆕 Advanced Features**
- 📅 **Enhanced Calendar**: Date pickers, code dropdowns, email integration
- 📧 **Smart Notifications**: Automated daily reminders (6:00 AM Baghdad time)
- 🔄 **Live Updates**: Real-time data synchronization
- 📝 **Comprehensive Notes**: تێبینی functionality across modules
- 🐳 **Docker Ready**: Full containerization with health checks

---

## 🏫 System Modules

| Category | Modules | Kurdish |
|----------|---------|---------|
| **📚 Academic** | Calendar, Teachers, Exam Supervision, Activities | ساڵنامە، مامۆستایان، تاقیکردنەوە، چالاکی |
| **👥 HR & Students** | Staff Records, Student Supervision, Permissions, Bus | ستاف، خوێندکاران، مۆڵەت، پاس |
| **💰 Financial** | Payroll, Installments, Daily Accounts, Expenses | موچە، قیست، حساب، خەرج |

<details>
<summary>📋 Complete Module List (17+ modules)</summary>

### 📚 Academic Management
- **Calendar Management** (بەڕێوەبردنی ساڵنامە) - Enhanced scheduling with email integration
- **Teacher Records** (تۆماری مامۆستایان) - Complete profiles with health tracking
- **Teacher Information** (زانیاری مامۆستایان) - Subject assignments and details
- **Exam Supervision** (سەرپەرەشتی تاقیکردنەوە) - Examination monitoring (grades 1-9)
- **Activities Management** (چالاکی) - School events planning

### 👥 Staff & Student Management
- **Staff Records** (تۆمارەکانی ستاف) - Complete HR management
- **Supervised Students** (سەرپەرەشتی خوێندکاران) - Student monitoring with violation tracking
- **Student Permissions** (مۆڵەت) - Leave management and approval workflow
- **Employee Leaves** (مۆڵەتی کارمەندان) - Staff leave tracking
- **Bus Management** (پاس) - Transportation management

### 💰 Financial Management
- **Payroll Management** (لیستی بڕی موچە) - Salary processing
- **Annual Installments** (قیستی ساڵانە) - Fee collection and tracking
- **Daily Accounts** (حساباتی رۆژانە) - Daily transactions
- **Monthly Expenses** (خەرجی مانگانە) - Budget management
- **Building Expenses** (مەسروفی بینا) - Infrastructure costs
- **Kitchen Expenses** (خەرجی خواردنگە) - Food service management

</details>

---

## 🚀 Installation

### Prerequisites
- **Node.js** 18.x+
- **MongoDB** 6.0+
- **Yarn** package manager

### 🛠️ Local Development

```bash
# Clone and setup
git clone https://github.com/bazhdarrzgar/sada.git
cd sada && yarn install

# Start MongoDB (choose one)
docker run -d -p 27017:27017 --name mongodb mongo:6.6.0
# OR: sudo systemctl start mongod

# Start development server
yarn dev
```

### 🐳 Docker Setup (Recommended)

```bash
# One-click setup
git clone https://github.com/bazhdarrzgar/sada.git
cd sada && docker-compose up -d

# Verify setup
docker-compose ps && docker-compose logs -f
```

---

## 📅 Enhanced Calendar System

### 🎯 Key Features
- **📅 Date Pickers**: Exact date selection with traditional weekly grid
- **🔽 Smart Dropdowns**: Searchable code selection with descriptions  
- **📆 Bilingual Months**: Kurdish/English month selection
- **📧 Auto Email Tasks**: Automatic task creation with notifications
- **🕕 Baghdad Time**: Scheduled notifications at 6:00 AM local time

### 📋 Code System
Record Type Codes Reference (كۆدەكانی جۆرەكانی تۆمار):
- `A` - Registration Records
- `B` - Media & Communications  
- `C` - HR Staff Records
- `D` - Electronic Records
- `E1-E3` - Educational Categories
- *[34+ total codes available]*

### 🔧 Usage
```bash
1. Calendar Management → "Add New Entry"
2. Select Month & Year (e.g., "June 2025")
3. Choose codes for each day using enhanced dropdowns
4. System auto-generates email tasks with descriptions
5. Daily notifications sent at 6:00 AM Baghdad time
```

---

## 📧 Email Notification System

**⚡ Automated Features**
- Daily notifications at 6:00 AM Baghdad time
- Smart code extraction from calendar entries
- Rich email content with task descriptions
- Date-specific scheduling with timezone handling

**🛠️ Configuration**
```bash
# Admin Panel: Calendar → Advanced Email & Schedule Management
- Sender Email: Gmail account with app password
- Target Email: Notification recipient  
- Schedule Time: 6:00 AM Baghdad (configurable)
- Test Functions: Available in admin controls
```

---

## 🗄️ Database & API

### Database Structure
```yaml
Database: sada (MongoDB)
Connection: mongodb://localhost:27017/sada
Key Collections:
  - calendar_entries: Enhanced calendar data with emailTasks
  - email_tasks: Dedicated email task storage  
  - teachers, staff, activities: Module-specific data
  - legend_entries: Code definitions with usage tracking
```

### API Endpoints
```http
# Calendar Management
GET/POST  /api/calendar           # Calendar CRUD operations
GET/POST  /api/email-tasks        # Email task management
GET       /api/daily-notifications # Today's scheduled tasks

# System APIs  
GET/POST  /api/legend             # Code definitions
GET/POST  /api/email-settings     # Email configuration
```

---

## 🛠️ Technology Stack

**Frontend**
- Next.js 14.2.3 (App Router) + React 18
- Tailwind CSS 3.4.1 + Radix UI components
- Fuse.js (search) + Lucide icons

**Backend** 
- Next.js API Routes + MongoDB 6.6.0
- Nodemailer + Node-cron (scheduling)
- UUID v4 (identifiers)

**DevOps**
- Docker + Docker Compose
- Yarn 1.22.22 + ESLint/Prettier
- Health checks + persistent volumes

---

## 🔒 Security & Authentication

**Login Credentials**
```bash
URL: http://localhost:3000
Username: berdoz
Password: berdoz@code
```

**Security Features**
- Session-based authentication with secure storage
- Input validation using Zod schemas
- XSS protection with React escaping
- CORS configuration for API security

---

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
# Setup environment
cp .env.production.example .env.production
# Edit .env.production with secure credentials

# Deploy with production config  
docker-compose -f docker-compose.prod.yml up -d
```

### Services
| Service | Port | Description |
|---------|------|-------------|
| sada_app | 3000 | Next.js application |
| sada_mongodb | 27017 | MongoDB database |
| sada_nginx | 80/443 | Nginx proxy (prod) |

---

## 📞 Support & Contributing

### 🆘 Getting Help
- **Issues**: [GitHub Issues](https://github.com/bazhdarrzgar/sada/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bazhdarrzgar/sada/discussions)
- **Email**: For private support inquiries

### 🤝 Contributing
1. Fork repository and create feature branch
2. Follow existing code style and conventions  
3. Test thoroughly across browsers
4. Update documentation including README
5. Submit pull request with detailed description

### 🛠️ Development Commands
```bash
# Development
yarn dev              # Start development server
yarn build           # Production build test
yarn lint            # ESLint checking  
yarn format          # Prettier formatting

# Docker management
docker-compose ps                    # Service status
docker-compose logs -f app          # View application logs
docker-compose restart app          # Restart application
docker-compose down -v              # Reset all data ⚠️
```

---

## 🏆 Project Status

**🎯 Production Ready Features**
- ✅ Enhanced Calendar System with email integration
- ✅ Bilingual Support (Kurdish/English interface)  
- ✅ 17+ Management Modules (Academic, HR, Financial)
- ✅ Docker Containerization with health checks
- ✅ Mobile-Responsive Design (desktop/tablet/mobile)
- ✅ Email Automation with smart scheduling

**🔄 Latest Updates (December 2024)**
- Enhanced calendar with year selection and improved edit interface
- Smart email task integration with Baghdad timezone
- Performance optimizations and UI/UX improvements
- New API endpoints for better task management

---

<div align="center">

**🏫 Built for Kurdish Educational Institutions**  
**سەدا - بۆ دامەزراوە پەروەردەییەکانی کوردستان**

*Production Ready • Docker Containerized • Bilingual Support*

[![⭐ Star Repository](https://img.shields.io/github/stars/bazhdarrzgar/sada?style=social)](https://github.com/bazhdarrzgar/sada)
[![🐛 Report Issues](https://img.shields.io/github/issues/bazhdarrzgar/sada)](https://github.com/bazhdarrzgar/sada/issues)
[![📖 Documentation](https://img.shields.io/badge/docs-wiki-blue)](https://github.com/bazhdarrzgar/sada/wiki)

**Made with ❤️ in Kurdistan | Powered by Next.js & MongoDB**

</div>