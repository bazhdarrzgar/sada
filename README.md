# 🏫 Berdoz Management System
**سیستەمی بەڕێوەبردنی بەردۆز**

A comprehensive, bilingual (Kurdish/English) educational institution management system built with Next.js 14, MongoDB, and modern web technologies. This system provides complete school administration capabilities including staff management, student tracking, financial management, and academic oversight.

![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.6.0-green?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📋 Table of Contents

- [🎯 System Overview](#-system-overview)
- [🚀 Quick Start](#-quick-start)
- [💾 Database Collections](#-database-collections)
- [🏗️ Technology Stack](#️-technology-stack)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [🌱 Database Seeding](#-database-seeding)
- [🔐 Authentication](#-authentication)
- [🌐 API Documentation](#-api-documentation)
- [🎨 Features](#-features)
- [🧪 Testing](#-testing)
- [🚨 Troubleshooting](#-troubleshooting)
- [📞 Support](#-support)

---

## 🎯 System Overview

### 🌟 **Current Status (August 2025)**
- ✅ **Complete Database Coverage**: All 17 modules with comprehensive data
- ✅ **Production Ready**: Fully functional with realistic sample data
- ✅ **Bilingual Support**: Complete Kurdish/English localization
- ✅ **Modern Architecture**: Next.js 14 with App Router and MongoDB
- ✅ **Professional UI**: Responsive design with Tailwind CSS and Radix UI

### 🏛️ **System Modules**

The Berdoz Management System features **17 comprehensive modules** organized into logical categories:

#### 📚 **Academic Management**
| Module | Kurdish Name | Records | Description |
|--------|-------------|---------|-------------|
| Calendar Management | بەڕێوەبردنی ساڵنامە | 12 | Monthly task scheduling and organization |
| Teacher Records | تۆماری مامۆستایان | 15 | Teacher academic and professional profiles |
| Teacher Information | زانیاری مامۆستایان | 15 | Subject assignments and workload tracking |
| Exam Supervision | سەرپەرەشتی تاقیکردنەوە | 15 | Examination monitoring and results |
| Activities Management | چالاکی | 12 | School events and extracurricular planning |

#### 👥 **Staff & Student Management**
| Module | Kurdish Name | Records | Description |
|--------|-------------|---------|-------------|
| Staff Records | تۆمارەکانی ستاف | 15 | Employee information and HR management |
| Supervised Students | سەرپەرەشتی خوێندکاران | 15 | Student monitoring and disciplinary management |
| Student Permissions | مۆڵەت | 15 | Student leave and permission management |
| Employee Leaves | مۆڵەتی کارمەندان | 12 | Employee leave management |
| Supervision | سەرپەرەشتی | 12 | Academic and administrative supervision tracking |

#### 💰 **Financial Management**
| Module | Kurdish Name | Records | Description |
|--------|-------------|---------|-------------|
| Payroll Management | لیستی بڕی موچە | 15 | Employee salary and compensation processing |
| Annual Installments | قیستی ساڵانە | 15 | Student fee collection and payment tracking |
| Monthly Expenses | خەرجی مانگانە | 12 | Institutional expense management |
| Building Expenses | مەسروفی بینا | 12 | Infrastructure and maintenance costs |
| Daily Accounts | حساباتی رۆژانە | 15 | Daily financial transaction records |
| Kitchen Expenses | خەرجی خواردنگە | 12 | Food service and kitchen supply management |

#### 🔧 **System Management**
| Module | Kurdish Name | Records | Description |
|--------|-------------|---------|-------------|
| Legend Management | پێناسەکان | 15 | System abbreviations and code definitions |

### 🌟 **Key Features**
- 🇰🇺 **Bilingual Interface**: Complete Kurdish (Sorani) and English language support
- 💡 **Real-time Calculations**: Automatic financial computations across all modules
- 🔄 **Comprehensive CRUD**: Full create, read, update, delete operations for all data
- 🔍 **Advanced Search**: Powerful filtering and search functionality in every module
- 📱 **Responsive Design**: Modern, mobile-friendly interface with Tailwind CSS
- 🔐 **Secure Authentication**: Protected access with session management
- 📊 **Data Relationships**: Intelligent linking between students, teachers, and administrative data

---

## 🚀 Quick Start

### 📋 Prerequisites
- **Node.js** 18.x or higher
- **MongoDB** 6.0+ (local installation)
- **Yarn** package manager (recommended)

### ⚡ **One-Command Setup**

```bash
# Clone the repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# Install dependencies
yarn install

# Run automated setup (recommended)
./bash.sh
```

### 🔧 **Manual Setup**

```bash
# 1. Install dependencies
yarn install

# 2. Start MongoDB (if not running)
sudo systemctl start mongod
# or with Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.6.0

# 3. Seed database with sample data
node seed-database.js

# 4. Start development server
yarn dev

# 5. Access application
# Navigate to http://localhost:3000
```

### 🔑 **Default Access**
- **URL**: http://localhost:3000
- **Authentication**: Bilingual login interface
- **Sample Data**: 200+ realistic records across all modules

---

## 💾 Database Collections

### 📊 **Complete Data Coverage**

| Collection | Records | Key Fields | Purpose |
|------------|---------|------------|---------|
| **calendar_entries** | 12 | month, weeks, year | Monthly scheduling |
| **staff_records** | 15 | fullName, department, education | HR management |
| **teachers** | 15 | teacherName, subject, qualification | Teacher profiles |
| **teacher_info** | 15 | subject, hours, experience | Workload tracking |
| **supervised_students** | 15 | studentName, behavior, performance | Student monitoring |
| **payroll** | 15 | employeeName, salary, deductions | Salary management |
| **activities** | 12 | activityType, content, dates | Event planning |
| **exam_supervision** | 15 | subject, supervisor, achievement | Exam oversight |
| **employee_leaves** | 12 | employeeName, leaveType, duration | Leave management |
| **supervision** | 12 | supervisorName, findings, recommendations | Quality assurance |
| **installments** | 15 | studentName, payments, remaining | Fee tracking |
| **monthly_expenses** | 12 | month, categories, total | Budget management |
| **building_expenses** | 12 | item, cost, month | Infrastructure costs |
| **daily_accounts** | 15 | purpose, amount, checkNumber | Daily transactions |
| **kitchen_expenses** | 12 | item, cost, month | Food service costs |
| **student_permissions** | 15 | studentName, reason, status | Permission management |
| **legend_entries** | 15 | abbreviation, description, category | System definitions |

### 🎯 **Data Quality Features**
- ✅ **Zero Empty Fields**: All columns properly filled with meaningful data
- ✅ **Realistic Content**: Authentic Kurdish names, addresses, and terminology
- ✅ **Proper Relationships**: Consistent data connections between collections
- ✅ **Bilingual Content**: Kurdish and English text throughout
- ✅ **Financial Accuracy**: Realistic amounts in Iraqi Dinar (IQD)

---

## 🏗️ Technology Stack

### 🖥️ **Frontend**
- **Framework**: Next.js 14.2.3 with App Router
- **UI Library**: React 18 with modern hooks
- **Styling**: Tailwind CSS 3.4.1 with Kurdish language support
- **Components**: Radix UI for accessibility and consistency
- **Icons**: Lucide React for professional iconography
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack React Table for advanced data presentation

### 🗄️ **Backend & Database**
- **Database**: MongoDB 6.6.0 with optimized collections
- **API**: Next.js API Routes with RESTful endpoints
- **Validation**: Server-side validation with Zod schemas
- **Authentication**: Session-based authentication system

### 🔧 **Development Tools**
- **Package Manager**: Yarn 1.22.22
- **Date Handling**: date-fns for comprehensive date operations
- **State Management**: React Context API with optimized hooks
- **Development**: Hot reload for both frontend and backend

---

## 📁 Project Structure

```
berdoz-management-system/
├── 📂 app/                      # Next.js App Router directory
│   ├── 📂 api/                 # Backend API routes (17 modules)
│   │   ├── 📂 calendar/        # Calendar management endpoints
│   │   ├── 📂 staff/           # Staff records management
│   │   ├── 📂 teachers/        # Teacher records management
│   │   ├── 📂 teacher-info/    # Teacher information management
│   │   ├── 📂 payroll/         # Payroll processing endpoints
│   │   ├── 📂 activities/      # Activities management
│   │   ├── 📂 student-permissions/ # Student permissions handling
│   │   ├── 📂 exam-supervision/ # Exam supervision tracking
│   │   ├── 📂 supervision/     # General supervision management
│   │   ├── 📂 supervised-students/ # Student monitoring
│   │   ├── 📂 installments/    # Payment installment management
│   │   ├── 📂 monthly-expenses/ # Monthly expense tracking
│   │   ├── 📂 building-expenses/ # Building cost management
│   │   ├── 📂 daily-accounts/  # Daily financial records
│   │   ├── 📂 kitchen-expenses/ # Kitchen expense management
│   │   ├── 📂 employee-leaves/ # Employee leave management
│   │   └── 📂 legend/          # Legend and abbreviation management
│   ├── 📂 [module-pages]/      # Individual module page directories
│   ├── 📄 globals.css          # Global styles and Tailwind imports
│   ├── 📄 layout.js            # Root layout with authentication
│   └── 📄 page.js              # Main dashboard and login interface
├── 📂 components/               # Reusable React components
│   ├── 📂 ui/                  # Base UI components (Radix UI + Tailwind)
│   ├── 📂 auth/                # Authentication-related components
│   ├── 📂 layout/              # Layout and navigation components
│   ├── 📂 management/          # Business logic components
│   └── 📂 payroll/             # Specialized payroll components
├── 📂 lib/                      # Utility libraries and configurations
│   ├── 📄 mongodb.js           # MongoDB connection and utilities
│   └── 📄 utils.js             # General utility functions
├── 📂 hooks/                    # Custom React hooks
│   ├── 📄 use-mobile.jsx       # Mobile device detection
│   └── 📄 use-toast.js         # Toast notification system
├── 📄 seed-database.js         # Comprehensive database seeding script
├── 📄 bash.sh                  # Automated setup and seeding script
├── 📄 .env.local               # Environment variables configuration
├── 📄 package.json             # Dependencies and scripts
├── 📄 tailwind.config.js       # Tailwind CSS configuration
└── 📄 README.md                # This documentation
```

---

## 🔧 Configuration

### 🌍 **Environment Variables**

The project uses a pre-configured `.env.local` file:

```env
MONGO_URL=mongodb://localhost:27017
MONGODB_URI=mongodb://localhost:27017
DB_NAME=berdoz_management
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 🔄 **Available Scripts**

```bash
# Development
yarn dev              # Start development server with hot reload
yarn dev:no-reload    # Start without hot reload
yarn dev:webpack     # Start with webpack optimization

# Production
yarn build           # Create production build
yarn start           # Start production server

# Database
node seed-database.js # Seed database with sample data
./bash.sh            # Complete automated setup
```

---

## 🌱 Database Seeding

### 📊 **Comprehensive Data Coverage**

The seeding system provides realistic data for all 17 collections:

```bash
# Quick setup
./bash.sh

# Manual seeding
node seed-database.js
```

### 📈 **Seeding Summary**
- **Total Records**: 200+ across all collections
- **Data Quality**: No empty fields, all columns filled
- **Content Type**: Bilingual Kurdish/English content
- **Relationships**: Consistent data connections
- **Financial Data**: Realistic amounts in Iraqi Dinar

### 🛠️ **Automated Setup Script Features**

The `bash.sh` script provides:
- ✅ MongoDB connection verification
- ✅ Environment variable loading
- ✅ Dependency checking
- ✅ Database seeding with progress tracking
- ✅ Error handling and troubleshooting guidance

---

## 🔐 Authentication

### 🔑 **Security Features**
- **Session Management**: Persistent authentication with proper logout
- **Route Protection**: Access control for all administrative functions
- **Input Validation**: Comprehensive data validation with Zod schemas
- **XSS Protection**: Sanitized inputs and outputs throughout the application
- **CSRF Protection**: Secure form handling with Next.js built-in protections

### 🚪 **Login Process**
1. **Bilingual Interface**: Kurdish and English login options
2. **Session Creation**: Secure session establishment with persistence
3. **Route Protection**: Automatic redirect to login for unauthenticated users
4. **Session Maintenance**: Persistent login state across browser sessions

---

## 🌐 API Documentation

### 🔄 **RESTful API Structure**

All modules support standard CRUD operations:

```
GET    /api/[module]     # Retrieve all records
POST   /api/[module]     # Create new record
PUT    /api/[module]     # Update existing record
DELETE /api/[module]?id  # Delete record by ID
```

### 📋 **Available Endpoints**

| Endpoint | Module | Purpose |
|----------|--------|---------|
| `/api/calendar` | Calendar Management | Task and schedule management |
| `/api/staff` | Staff Records | Employee information management |
| `/api/teachers` | Teacher Records | Teacher profiles and data |
| `/api/teacher-info` | Teacher Information | Subject assignments and workload |
| `/api/payroll` | Payroll | Salary and compensation management |
| `/api/activities` | Activities | School activities and events |
| `/api/student-permissions` | Student Permissions | Student leave management |
| `/api/exam-supervision` | Exam Supervision | Examination oversight |
| `/api/supervision` | Supervision | General supervision tracking |
| `/api/supervised-students` | Supervised Students | Student monitoring |
| `/api/installments` | Installments | Payment tracking |
| `/api/monthly-expenses` | Monthly Expenses | Expense management |
| `/api/building-expenses` | Building Expenses | Infrastructure costs |
| `/api/daily-accounts` | Daily Accounts | Financial transactions |
| `/api/kitchen-expenses` | Kitchen Expenses | Food service costs |
| `/api/employee-leaves` | Employee Leaves | Staff leave management |
| `/api/legend` | Legend | System abbreviations |

---

## 🎨 Features

### 🖥️ **User Interface**
- **Professional Design**: Clean, modern interface with consistent design language
- **Kurdish Language Support**: Proper RTL text rendering and Kurdish typography
- **Responsive Layout**: Seamless experience across desktop, tablet, and mobile devices
- **Accessibility**: Built with Radix UI for maximum accessibility compliance
- **Color-Coded Data**: Intuitive color schemes for different data types and statuses

### ⚡ **Performance**
- **Fast Loading**: Dashboard loads within 2-3 seconds
- **Instant Navigation**: Module switching without authentication loops
- **Optimized Queries**: Efficient MongoDB queries with proper indexing
- **Memory Management**: Efficient memory usage with NODE_OPTIONS optimization

### 🔍 **Search & Navigation**
- **Advanced Search**: Live filtering across all data modules
- **Cross-Module Search**: Search functionality spanning multiple collections
- **Intelligent Navigation**: Context-aware routing and breadcrumbs

---

## 🧪 Testing

### ✅ **System Verification**
```bash
# Database verification
mongosh berdoz_management --eval "db.getCollectionNames()"

# Collection counts
mongosh berdoz_management --eval "
db.getCollectionNames().forEach(collection => {
  const count = db.getCollection(collection).countDocuments();
  print(collection + ': ' + count + ' records');
});"

# API testing
curl http://localhost:3000/api/staff
```

### 📊 **Testing Coverage**
- **Database Layer**: All 17 collections with comprehensive data
- **API Layer**: All endpoints tested and functional
- **Authentication**: Login/logout with persistent sessions
- **CRUD Operations**: Data creation, modification, and deletion
- **UI/UX**: Interface responsiveness and Kurdish language rendering

---

## 🚨 Troubleshooting

### 🔧 **Common Issues & Solutions**

#### **Database Connection Issues**
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Verify collections
mongosh berdoz_management --eval "db.getCollectionNames()"

# Restart MongoDB
sudo systemctl restart mongod
```

#### **Authentication Problems**
1. Clear browser cache and localStorage: `Ctrl+Shift+Delete`
2. Hard refresh the page: `Ctrl+F5`
3. Verify MongoDB is running and accessible

#### **Empty Data Issues**
```bash
# Re-seed database
./bash.sh

# Or manually
node seed-database.js

# Check API endpoints
curl http://localhost:3000/api/staff
```

#### **Development Server Issues**
```bash
# Kill existing processes
pkill -f "next dev"

# Restart development server
yarn dev

# Check port availability
lsof -i :3000
```

### 🆘 **Getting Help**
- **Error Logs**: Check console for detailed error messages
- **MongoDB Logs**: Use `mongosh` for database debugging
- **Network Issues**: Verify port 3000 and 27017 availability
- **Dependencies**: Run `yarn install` if packages are missing

---

## 📞 Support

### 📧 **Contact Information**
- **GitHub Issues**: [Create a GitHub Issue](https://github.com/bazhdarrzgar/sada/issues)
- **Technical Support**: Use GitHub repository for technical questions
- **Feature Requests**: Submit through GitHub discussions
- **Community**: Join Kurdish educational technology discussions

### 📖 **Resources**
- **Documentation**: This comprehensive README
- **Code Examples**: Well-documented source code throughout the project
- **API Reference**: RESTful endpoints with standard operations
- **Database Schema**: MongoDB collections with sample data

---

## 🏆 **Final Status Summary**

✅ **Database**: 200+ realistic records across all 17 modules  
✅ **Authentication**: Secure login with persistent sessions  
✅ **API Endpoints**: All CRUD operations tested and functional  
✅ **UI/UX**: Professional, responsive, bilingual interface  
✅ **Documentation**: Comprehensive setup and troubleshooting guides  
✅ **Automation**: One-command setup with error handling  
✅ **Production Ready**: Fully functional system ready for educational institutions  

---

**🎉 The Berdoz Management System is now complete and ready for deployment!**

---

<div align="center">

**🏫 Built with ❤️ for Kurdish Educational Institutions**

*Latest Update: August 1, 2025 - Complete system with comprehensive database seeding and professional documentation*

**🌟 Ready for Production Use**

[⭐ Star this repository](https://github.com/bazhdarrzgar/sada) | [🐛 Report Issues](https://github.com/bazhdarrzgar/sada/issues) | [💡 Feature Requests](https://github.com/bazhdarrzgar/sada/discussions)

</div>