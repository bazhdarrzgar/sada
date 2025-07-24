# Berdoz Management System

A comprehensive management system for educational institutions, built with Next.js and SQLite. This bilingual (Kurdish/English) application features calendar management, staff records, payroll management, annual installments tracking, monthly expenses management, and a modern UI using Tailwind CSS and Radix UI components.

![Berdoz Management System](https://img.shields.io/badge/Next.js-14.2.3-black?style=for-the-badge&logo=next.js)
![SQLite](https://img.shields.io/badge/SQLite-3.0-blue?style=for-the-badge&logo=sqlite)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)

## 📋 System Overview

The Berdoz Management System is a complete educational institution management solution featuring **6 main modules**:

1. **📅 Calendar Management** - Task organization and scheduling
2. **👥 Staff Records** - Employee information and HR management  
3. **💰 Payroll Management** - Salary processing and compensation tracking
4. **🔍 Supervision System** - Teacher and student monitoring
5. **💳 Annual Installments** - Student payment and installment tracking
6. **📊 Monthly Expenses** - Institutional expense management

### Key Capabilities
- **Bilingual Interface**: Full Kurdish and English language support
- **Real-time Calculations**: Automatic financial computations across all modules
- **Comprehensive CRUD**: Create, read, update, delete operations for all data
- **Advanced Search**: Filter and search functionality in every module
- **Professional UI**: Modern, responsive design with Tailwind CSS and Radix UI
- **Data Persistence**: MongoDB integration with local fallback functionality

## 🌟 Features

### 📅 Calendar Management (بەڕێوەبردنی ساڵنامە)
- **Monthly Task Tracking**: Organize tasks and activities by month with weekly breakdown (W/1, W/2, W/3, W/4)
- **Code-based System**: Use abbreviations and codes for efficient task categorization
- **Legend Management**: Automatic legend generation with 20+ predefined abbreviations
- **Full CRUD Operations**: Create, read, update, and delete calendar entries
- **Search & Filter**: Find entries by month or task codes
- **Usage Tracking**: Monitor how frequently each code is used

### 👥 Staff Records (تۆمارەکانی ستاف)
- **Complete Employee Profiles**: Manage detailed staff information including:
  - Personal details (name, mobile, address, gender, date of birth)
  - Educational background (certificates, education, age)
  - Professional information (department, attendance, contract type)
- **Kurdish Language Interface**: Fully localized interface in Kurdish
- **Attendance Tracking**: Monitor staff presence and absence
- **Contract Management**: Track permanent, temporary, and contract employees
- **Advanced Search**: Filter by name, department, mobile, or address

### 💰 Payroll Management (لیستی بڕی موچە)
- **Comprehensive Salary Management**: Track employee compensation with:
  - Base salary (موچە)
  - Absence deductions (نەھاتن)
  - Additional deductions (لێ برین)
  - Bonuses and awards (پاداشت)
  - Auto-calculated totals (کۆی گشتی)
- **Real-time Calculations**: Automatic total computation when values change
- **Notes System**: Add comments and observations for each employee
- **Inline Editing**: Quick edit functionality with save/cancel options
- **Kurdish Interface**: Bilingual support for all payroll operations

### 🔍 Supervision System (چاودێری)
- **Teacher Supervision**: Monitor and track teacher performance with:
  - Teacher information (name, subject, department, grade)
  - Violation types and punishment tracking
  - Performance evaluation records
- **Student Supervision**: Comprehensive student monitoring including:
  - Student details (name, department, grade)
  - Behavioral tracking and violation records
  - Disciplinary action management
- **Dual Interface**: Separate tabs for teacher and student supervision
- **Full Documentation**: Complete record-keeping for both categories

### 💳 Annual Installments (قیستی ساڵانه)
- **Student Payment Tracking**: Comprehensive installment management with:
  - Annual amount tracking (بڕی پارەی ساڵانە)
  - Six installment periods (قیستی یەکەم تا شەشەم)
  - Auto-calculated totals (بڕی وەرگیراو)
  - Outstanding balance tracking (چەندی ماوە)
- **Student Information**: Complete student profiles with grade levels
- **Payment Types**: Different installment categories and classifications
- **Financial Overview**: Real-time calculations of received and remaining amounts
- **Search & Filter**: Find students by name, grade, or installment type

### 📊 Monthly Expenses (خەرجی مانگانه)
- **Comprehensive Expense Tracking**: Monitor all institutional expenses including:
  - Staff salaries (موچەی ستاف)
  - General expenses (مەسروفات)
  - Building rent (کرێی بینا)
  - Drama fees (باجی درامەت)
  - Social support (دەستەبەری کۆمەڵایەتی)
  - Electricity costs (کارەبا)
- **Monthly Organization**: Year and month-based expense tracking
- **Auto-calculations**: Automatic total computation (کۆی گشتی)
- **Notes System**: Add detailed comments for each expense entry
- **Financial Planning**: Historical expense data for budgeting and planning

## 🏗️ Technology Stack

- **Frontend**: Next.js 14.2.3 with React 18
- **Backend**: FastAPI 0.110.1 with Python
- **Database**: SQLite with SQLAlchemy ORM
- **Styling**: Tailwind CSS 3.4.1 with custom configurations
- **UI Components**: Radix UI for accessible, unstyled components
- **Icons**: Lucide React for consistent iconography
- **Forms**: React Hook Form with Zod validation
- **Tables**: TanStack React Table for advanced table functionality
- **Date Handling**: date-fns for date manipulation
- **State Management**: React hooks with local state

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes for backend logic
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout component
│   └── page.js            # Main application component
├── backend/               # FastAPI backend
│   ├── server.py          # Main FastAPI application with SQLite
│   ├── requirements.txt   # Python dependencies
│   ├── .env              # Backend environment variables
│   └── berdoz_management.db # SQLite database file
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   └── management/       # Business logic components
├── lib/                   # Utility libraries
│   ├── mongodb.js        # Database connection (legacy)
│   └── utils.js          # Helper functions
├── hooks/                 # Custom React hooks
├── .env.local            # Frontend environment variables
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 16.x or higher
- **MongoDB** (local installation or cloud instance)
- **Yarn** package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bazhdarrzgar/sada.git
   cd sada
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=berdoz_management
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Login to the system:**
   - **Username**: `berdoz`
   - **Password**: `berdoz@code`

## 🔐 Authentication

The application features a secure authentication system:
- **Secure Login**: Protected access with username/password authentication
- **Session Management**: Persistent login state with localStorage
- **User Interface**: Bilingual login interface (Kurdish/English)
- **Access Control**: Protected routes and user session management
- **Logout Functionality**: Secure session termination with confirmation dialog

## 📚 API Endpoints

The application implements Next.js API routes under `app/api/`:

### Calendar Management
- `GET /api/calendar` - Retrieve all calendar entries
- `POST /api/calendar` - Create new calendar entry
- `PUT /api/calendar/[id]` - Update existing calendar entry
- `DELETE /api/calendar/[id]` - Delete calendar entry

### Staff Management
- `GET /api/staff` - Retrieve all staff records
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/[id]` - Update staff information
- `DELETE /api/staff/[id]` - Remove staff member

### Payroll Management
- `GET /api/payroll` - Retrieve all payroll records
- `POST /api/payroll` - Create new payroll entry
- `PUT /api/payroll/[id]` - Update payroll information
- `DELETE /api/payroll/[id]` - Delete payroll record

### Supervision Management
- `GET /api/supervision` - Retrieve all supervision records
- `POST /api/supervision` - Create new supervision entry
- `PUT /api/supervision/[id]` - Update supervision information
- `DELETE /api/supervision/[id]` - Delete supervision record

### Annual Installments Management
- `GET /api/installments` - Retrieve all installment records
- `POST /api/installments` - Create new installment entry
- `PUT /api/installments/[id]` - Update installment information
- `DELETE /api/installments/[id]` - Delete installment record

### Monthly Expenses Management
- `GET /api/monthly-expenses` - Retrieve all expense records
- `POST /api/monthly-expenses` - Create new expense entry
- `PUT /api/monthly-expenses/[id]` - Update expense information
- `DELETE /api/monthly-expenses/[id]` - Delete expense record

### Legend Management
- `GET /api/legend` - Retrieve legend entries
- `POST /api/legend` - Create new legend entry
- `PUT /api/legend/[id]` - Update legend entry

## 🎨 UI/UX Features

### Design Principles
- **Responsive Design**: Fully responsive layout that works on all devices
- **Accessibility**: Built with Radix UI for maximum accessibility
- **Kurdish Language Support**: Right-to-left text rendering and localization
- **Color Coding**: Intuitive color schemes for different data types
- **Loading States**: Smooth transitions and loading indicators

### Visual Elements
- **Blue Theme**: Professional blue color scheme throughout the application
- **Alternating Rows**: Blue and green alternating table rows for better readability
- **Status Indicators**: Color-coded badges for attendance, contract types, etc.
- **Icons**: Consistent Lucide React icons for all کردارەکان
- **Modal Dialogs**: Clean, centered modals for data entry

### Interactive Features
- **Inline Editing**: Click-to-edit functionality in tables
- **Auto-calculation**: Real-time calculations in payroll section
- **Search & Filter**: Live search across all data sections
- **Drag & Drop**: Future enhancement for task scheduling
- **Export Functions**: Future CSV/PDF export capabilities

## 🔧 Development Scripts

```bash
# Development server with hot reload
yarn dev

# Development server without hot reload
yarn dev:no-reload

# Development with webpack optimization
yarn dev:webpack

# Production build
yarn build

# Start production server
yarn start
```

## 🧪 Testing

The application includes a comprehensive testing protocol managed via `test_result.md`:

### Testing Strategy
- **Component Testing**: Individual component functionality
- **Integration Testing**: Full workflow testing
- **API Testing**: Backend endpoint validation
- **UI Testing**: User interface and interaction testing

### Testing Protocol
All testing follows the protocol defined in `test_result.md` which tracks:
- Backend task status and implementation
- Frontend component functionality
- Agent communication logs
- Testing priorities and stuck tasks

## 🌐 Localization

### Supported Languages
- **English**: Primary interface language
- **Kurdish (Sorani)**: Full localization for Kurdish users
- **Bilingual Labels**: All form fields and buttons include both languages

### Text Direction
- **LTR Support**: English text and numbers
- **RTL Support**: Kurdish text with proper alignment
- **Mixed Content**: Seamless handling of mixed language content

## 🔒 Data Management

### Local Storage
- **Demo Mode**: Application works with sample data without database
- **Graceful Fallback**: Continues to function if API is unavailable
- **Auto-sync**: Synchronizes with database when connection is restored

### Database Schema
- **Collections**: calendar, staff, payroll, legend
- **Relationships**: Linked data between staff records and payroll
- **Indexing**: Optimized queries for search functionality

## 🚦 Performance

### Optimization Features
- **Server-side Rendering**: Next.js SSR for improved performance
- **Code Splitting**: Automatic code splitting for faster loads
- **Image Optimization**: Next.js built-in image optimization
- **Caching**: Intelligent caching strategies for API calls

### Memory Management
- **Memory Limits**: NODE_OPTIONS='--max-old-space-size=512' for container optimization
- **Efficient Rendering**: Optimized React rendering with proper key usage
- **State Management**: Minimal re-renders with optimized state updates

## 🤝 Contributing

We welcome contributions to improve the Berdoz Management System!

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper testing
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style and structure
- Add tests for new features
- Update documentation as needed
- Ensure Kurdish language support for new features
- Test on both development and production environments

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Original Developer**: [bazhdarrzgar](https://github.com/bazhdarrzgar)
- **Contributors**: See [Contributors](https://github.com/bazhdarrzgar/sada/contributors)

## 🙏 Acknowledgments

- **Next.js Team**: For the excellent React framework
- **Radix UI**: For accessible UI components
- **Tailwind CSS**: For utility-first CSS framework
- **MongoDB**: For flexible document database
- **Kurdish Language Community**: For localization feedback

## 📞 Support

For support, email [support@berdoz.edu] or create an issue in the GitHub repository.

## 🗺️ Roadmap

### ✅ Recently Completed Features
- [x] **Annual Installments System**: Complete student payment tracking with installment management
- [x] **Monthly Expenses Management**: Comprehensive expense tracking including staff salaries, utilities, and operational costs
- [x] **Enhanced Financial Management**: Auto-calculations and real-time totals for all financial modules
- [x] **Improved UI/UX**: Professional table layouts with inline editing and responsive design

### Upcoming Features
- [ ] **Advanced Analytics**: Dashboard with charts and statistics for financial insights
- [ ] **Export Functions**: PDF and Excel export capabilities for all modules
- [ ] **Email Integration**: Automated notifications for payments and expenses
- [ ] **Role-based Access**: Different user roles and permissions (Admin, Staff, Finance)
- [ ] **Mobile App**: React Native mobile application for on-the-go management
- [ ] **Backup System**: Automated database backups and data recovery
- [ ] **Multi-tenant**: Support for multiple educational institutions
- [ ] **Financial Reports**: Automated monthly and yearly financial reports
- [ ] **Payment Gateway Integration**: Online payment processing for installments

### Technical Improvements
- [ ] **API Documentation**: Swagger/OpenAPI documentation
- [ ] **Unit Tests**: Comprehensive test coverage
- [ ] **CI/CD Pipeline**: Automated testing and deployment
- [ ] **Docker Support**: Containerization for easy deployment
- [ ] **TypeScript Migration**: Type safety improvements

---

**Built with ❤️ for Kurdish Educational Institutions**

*For more information, visit our [GitHub repository](https://github.com/bazhdarrzgar/sada)*