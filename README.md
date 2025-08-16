# 🏫 Berdoz Management System
**سیستەمی بەڕێوەبردنی بەردۆز**

A comprehensive bilingual (Kurdish/English) school management system with 17 modules covering all aspects of educational institution administration.

![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.6.0-green?style=for-the-badge&logo=mongodb)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Key Features

- 🇰🇺 **Bilingual Interface**: Full Kurdish (Sorani) and English support
- 🔍 **Enhanced Fuzzy Search**: Search across all columns in every module
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 🔐 **Secure Authentication**: Session-based login system
- 📊 **Real-time Calculations**: Automatic financial computations
- 📄 **Export & Print**: Download data as Excel or print reports
- 🎨 **Modern UI**: Beautiful interface with dark/light theme support

## 🚀 System Modules

### 📚 Academic Management
- **Calendar Management** (بەڕێوەبردنی ساڵنامە) - Monthly scheduling
- **Teacher Records** (تۆماری مامۆستایان) - Teacher profiles with health tracking
- **Teacher Information** (زانیاری مامۆستایان) - Subject assignments
- **Exam Supervision** (سەرپەرەشتی تاقیکردنەوە) - Examination monitoring
- **Activities Management** (چالاکی) - School events planning

### 👥 Staff & Student Management
- **Staff Records** (تۆمارەکانی ستاف) - Employee HR management
- **Supervised Students** (سەرپەرەشتی خوێندکاران) - Student monitoring
- **Student Permissions** (مۆڵەت) - Leave management
- **Employee Leaves** (مۆڵەتی کارمەندان) - Staff leave tracking
- **Supervision** (سەرپەرەشتی) - Quality assurance

### 💰 Financial Management
- **Payroll Management** (لیستی بڕی موچە) - Salary processing
- **Annual Installments** (قیستی ساڵانە) - Fee collection
- **Monthly Expenses** (خەرجی مانگانە) - Budget management
- **Building Expenses** (مەسروفی بینا) - Infrastructure costs
- **Daily Accounts** (حساباتی رۆژانە) - Daily transactions with enhanced date tracking
- **Kitchen Expenses** (خەرجی خواردنگە) - Food service management

### 🔧 System Management
- **Legend Management** (پێناسەکان) - System definitions

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- MongoDB 6.0+ (local installation or Docker)
- Yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/bazhdarrzgar/sada.git
cd sada

# Install dependencies
yarn install

# Start MongoDB (if not running)
sudo systemctl start mongod
# OR with Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.6.0

# Seed database with sample data
node ./scripts/seedDatabase.js

# Start development server
yarn dev

# Access the application
open http://localhost:3000
```

## 🔑 Login Information

- **URL**: http://localhost:3000
- **Username**: `berdoz`
- **Password**: `berdoz@code`

## 🆕 Latest Updates (August 2025)

- ✅ **Enhanced Fuzzy Search**: Daily Accounts and Kitchen Expenses now support search across ALL columns
- ✅ **Health Tracking**: Blood type fields added to staff and teacher records
- ✅ **Date Management**: Enhanced date tracking in financial modules
- ✅ **Mobile Optimization**: Improved responsive design across all modules
- ✅ **Export Features**: Enhanced print and download functionality

## 🛠️ Technology Stack

- **Frontend**: Next.js 14.2.3, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB 6.6.0
- **UI Components**: Radix UI, Lucide Icons
- **Search**: Fuse.js for fuzzy search functionality
- **Forms**: React Hook Form with Zod validation

## 🚨 Troubleshooting

### Common Issues

**Database Connection**
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Restart MongoDB if needed
sudo systemctl restart mongod
```

**Empty Data**
```bash
# Re-seed the database
node ./scripts/seedDatabase.js
```

**Port Issues**
```bash
# Kill existing processes on port 3000
pkill -f "next dev"
lsof -ti:3000 | xargs kill -9
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/bazhdarrzgar/sada/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bazhdarrzgar/sada/discussions)

---

<div align="center">

**🏫 Built for Kurdish Educational Institutions**

*Ready for Production Use*

[⭐ Star this repository](https://github.com/bazhdarrzgar/sada) | [🐛 Report Issues](https://github.com/bazhdarrzgar/sada/issues) | [💡 Feature Requests](https://github.com/bazhdarrzgar/sada/discussions)

</div>