'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Save, X, LogOut, User, Sun, Moon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/AuthContext'
import DetailedPayrollSection from '@/components/payroll/DetailedPayrollSection'
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from 'next-themes'



const BerdozManagementSystem = () => {
  const { user, logout } = useAuth()
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? / دڵنیایت لە دەرچوون؟')) {
      logout()
    }
  }
  // Initialize with sample data to demonstrate the system
  const [calendarData, setCalendarData] = useState([
    {
      id: 'sample-1',
      month: '1-Jun',
      week1: ['TB', 'C1', 'B,J', 'S', 'A,C'],
      week2: ['B,T', 'D', 'B,N', 'C1', 'A,C'],
      week3: ['B,T', 'D', 'B,N', 'C1', 'A,C'],
      week4: ['TB', 'V,P', 'L,Q,X', 'G,B1', 'O,J']
    },
    {
      id: 'sample-2',
      month: '1-Jul',
      week1: ['D,E', 'B,N', 'C1', 'A,C,N', 'B,T'],
      week2: ['D', 'B,N', 'C1', 'A,C,N', 'B,T'],
      week3: ['D,O', 'B,N', 'C1,G', 'A,C,N', 'B,T'],
      week4: ['D,B', 'B', 'C1', 'A,C,N', 'Y']
    },
    {
      id: 'sample-3',
      month: '1-Aug',
      week1: ['TB', 'D,E', 'B,N', 'C1', 'A,C,N'],
      week2: ['B,T', 'D', 'B,N', 'C1', 'A,C,N'],
      week3: ['TB', 'D,B', 'B,N', 'C1,G', 'A,C,N'],
      week4: ['Y', 'TB', 'D', 'C1', 'A,C']
    }
  ])
  
  const [legendData, setLegendData] = useState([
    { id: '1', abbreviation: 'A', full_description: 'Regis Name', category: 'General', usage_count: 15 },
    { id: '2', abbreviation: 'B', full_description: 'Media', category: 'General', usage_count: 12 },
    { id: '3', abbreviation: 'C', full_description: 'HR تۆمارەکانی ستاف', category: 'General', usage_count: 10 },
    { id: '4', abbreviation: 'D', full_description: 'Ewarrada Records', category: 'General', usage_count: 8 },
    { id: '5', abbreviation: 'TB', full_description: 'Daily Monitor Records', category: 'General', usage_count: 6 },
    { id: '6', abbreviation: 'C1', full_description: 'Student Pay', category: 'General', usage_count: 8 },
    { id: '7', abbreviation: 'J', full_description: 'Salary Records', category: 'General', usage_count: 4 },
    { id: '8', abbreviation: 'S', full_description: 'Subject Records', category: 'General', usage_count: 3 },
    { id: '9', abbreviation: 'T', full_description: 'CoCarBM Reco', category: 'General', usage_count: 5 },
    { id: '10', abbreviation: 'N', full_description: 'Report Records', category: 'General', usage_count: 7 },
    { id: '11', abbreviation: 'G', full_description: 'Material', category: 'General', usage_count: 2 },
    { id: '12', abbreviation: 'Y', full_description: 'Meeting & Discussion', category: 'General', usage_count: 2 },
    { id: '13', abbreviation: 'E', full_description: 'Bus Records', category: 'General', usage_count: 2 },
    { id: '14', abbreviation: 'O', full_description: 'Observed Student Records', category: 'General', usage_count: 2 },
    { id: '15', abbreviation: 'V', full_description: 'Clean Records', category: 'General', usage_count: 1 },
    { id: '16', abbreviation: 'P', full_description: 'Future Plan Records', category: 'General', usage_count: 1 },
    { id: '17', abbreviation: 'L', full_description: 'Activities Records', category: 'General', usage_count: 1 },
    { id: '18', abbreviation: 'Q', full_description: 'Security Records', category: 'General', usage_count: 1 },
    { id: '19', abbreviation: 'X', full_description: 'Student Profile Record', category: 'General', usage_count: 1 },
    { id: '20', abbreviation: 'B1', full_description: 'Orders', category: 'General', usage_count: 1 }
  ])
  
  // Payroll State
  const [payrollData, setPayrollData] = useState([
    {
      id: 'payroll-1',
      employeeName: 'رۆژهات شار محەمەد',
      salary: 130,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 130,
      notes: ''
    },
    {
      id: 'payroll-2',
      employeeName: 'ژیان حەسین علی',
      salary: 250,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 250,
      notes: ''
    },
    {
      id: 'payroll-3',
      employeeName: 'ئاوات رەشید عەلی',
      salary: 220,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 220,
      notes: ''
    },
    {
      id: 'payroll-4',
      employeeName: 'خاتوون شێرکۆ تاھیر',
      salary: 110,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 110,
      notes: ''
    },
    {
      id: 'payroll-5',
      employeeName: 'ژیان پانا حامد',
      salary: 200,
      absence: 5,
      deduction: 10,
      bonus: 0,
      total: 185,
      notes: '4'
    },
    {
      id: 'payroll-6',
      employeeName: 'شیرین ژاڵە عباس',
      salary: 260,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 260,
      notes: ''
    },
    {
      id: 'payroll-7',
      employeeName: 'محەمەد عەبدالقادر محەمەد',
      salary: 200,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 200,
      notes: ''
    },
    {
      id: 'payroll-8',
      employeeName: 'بەختیار ئیبراھیم مسعدی',
      salary: 375,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 375,
      notes: ''
    },
    {
      id: 'payroll-9',
      employeeName: 'سوزان سەلام کاروانی',
      salary: 130,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 130,
      notes: ''
    },
    {
      id: 'payroll-10',
      employeeName: 'بەسدار حەمە فەقی',
      salary: 110,
      absence: 0,
      deduction: 0,
      bonus: 5,
      total: 115,
      notes: '4'
    },
    {
      id: 'payroll-11',
      employeeName: 'سەرهەد ئازادم فەیق',
      salary: 280,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 280,
      notes: ''
    },
    {
      id: 'payroll-12',
      employeeName: 'محەمەد ڕەشکار ئەحمەد',
      salary: 132,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 132,
      notes: ''
    },
    {
      id: 'payroll-13',
      employeeName: 'صالح ژەبدلله محەمەد',
      salary: 425,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 425,
      notes: ''
    },
    {
      id: 'payroll-14',
      employeeName: 'محەمەد محمود محەمەد',
      salary: 550,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 550,
      notes: ''
    },
    {
      id: 'payroll-15',
      employeeName: 'لۆز رەحیمە خۆشی',
      salary: 275,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 275,
      notes: ''
    },
    {
      id: 'payroll-16',
      employeeName: 'علی عەدنان حەسین',
      salary: 400,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 400,
      notes: ''
    },
    {
      id: 'payroll-17',
      employeeName: 'زانا رەشید',
      salary: 300,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 300,
      notes: ''
    },
    {
      id: 'payroll-18',
      employeeName: 'یاریان هادی گەردی',
      salary: 420,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 420,
      notes: ''
    },
    {
      id: 'payroll-19',
      employeeName: 'محەمەد حەسین جودی',
      salary: 406,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 406,
      notes: ''
    },
    {
      id: 'payroll-20',
      employeeName: 'ناگل سپیرەدان حەسین',
      salary: 275,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 275,
      notes: ''
    },
    {
      id: 'payroll-21',
      employeeName: 'زانا عادل محەمەد',
      salary: 300,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 300,
      notes: ''
    },
    {
      id: 'payroll-22',
      employeeName: 'سیمین فەنن فەرەج',
      salary: 425,
      absence: 0,
      deduction: 0,
      bonus: 15,
      total: 440,
      notes: '4'
    },
    {
      id: 'payroll-23',
      employeeName: 'ھیوا',
      salary: 474,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 474,
      notes: ''
    },
    {
      id: 'payroll-24',
      employeeName: 'ئازاد سڵەیمان',
      salary: 330,
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 330,
      notes: ''
    }
  ])
  
  const [editingPayrollRow, setEditingPayrollRow] = useState(null)
  const [isAddPayrollDialogOpen, setIsAddPayrollDialogOpen] = useState(false)
  const [newPayrollEntry, setNewPayrollEntry] = useState({
    employeeName: '',
    salary: '',
    absence: 0,
    deduction: 0,
    bonus: 0,
    total: 0,
    notes: ''
  })

  // Supervision State
  const [supervisionData, setSupervisionData] = useState([
    {
      id: 'supervision-1',
      // Teacher supervision fields
      teacherName: 'أحمد حسن محمد',
      subject: 'الرياضيات',
      teacherDepartment: 'العلوم',
      teacherGrade: 'المرحلة الثانوية',
      teacherViolationType: 'التأخير',
      teacherPunishmentType: 'إنذار شفهي',
      // Student supervision fields
      studentName: 'فاطمة علي رشيد',
      studentDepartment: 'الأدب',
      studentGrade: 'الصف الثالث',
      studentViolationType: 'عدم أداء الواجب',
      studentPunishmentType: 'حسم درجات'
    },
    {
      id: 'supervision-2',
      // Teacher supervision fields
      teacherName: 'عمر خليل إبراهيم',
      subject: 'اللغة الإنجليزية',
      teacherDepartment: 'اللغات',
      teacherGrade: 'المرحلة المتوسطة',
      teacherViolationType: 'عدم الحضور',
      teacherPunishmentType: 'حسم راتب',
      // Student supervision fields
      studentName: 'زينب محمد صالح',
      studentDepartment: 'العلوم',
      studentGrade: 'الصف الثاني',
      studentViolationType: 'سوء السلوك',
      studentPunishmentType: 'إنذار كتابي'
    }
  ])
  
  const [editingSupervisionRow, setEditingSupervisionRow] = useState(null)
  const [isAddSupervisionDialogOpen, setIsAddSupervisionDialogOpen] = useState(false)
  const [newSupervisionEntry, setNewSupervisionEntry] = useState({
    teacherName: '',
    subject: '',
    teacherDepartment: '',
    teacherGrade: '',
    teacherViolationType: '',
    teacherPunishmentType: '',
    studentName: '',
    studentDepartment: '',
    studentGrade: '',
    studentViolationType: '',
    studentPunishmentType: ''
  })

  // تۆمارەکانی ستاف State
  const [staffData, setStaffData] = useState([
    {
      id: 'staff-1',
      fullName: 'Ahmed Hassan Mohammed',
      mobile: '+964 750 123 4567',
      address: 'Erbil, Kurdistan Region',
      gender: 'Male',
      dateOfBirth: '1985-03-15',
      marriage: '',
      certificate: 'Bachelor of Education',
      age: 39,
      education: 'University of Baghdad',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Mathematics',
      pass: 'Grade A',
      contract: 'Permanent'
    },
    {
      id: 'staff-2',
      fullName: 'Fatima Ali Rashid',
      mobile: '+964 750 987 6543',
      address: 'Sulaymaniyah, Kurdistan Region',
      gender: 'Female',
      dateOfBirth: '1990-07-22',
      certificate: 'Master of Science',
      age: 34,
      education: 'University of Sulaymaniyah',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Chemistry',
      pass: 'Grade A+',
      contract: 'Permanent'
    },
    {
      id: 'staff-3',
      fullName: 'Omar Khalil Ibrahim',
      mobile: '+964 751 456 7890',
      address: 'Duhok, Kurdistan Region',
      gender: 'Male',
      dateOfBirth: '1988-11-08',
      certificate: 'Bachelor of Arts',
      age: 36,
      education: 'University of Duhok',
      attendance: 'Absent',
      date: '2025-01-15',
      department: 'English',
      pass: 'Grade B+',
      contract: 'Temporary'
    },
    {
      id: 'staff-4',
      fullName: 'Zainab Mohammed Salih',
      mobile: '+964 752 321 0987',
      address: 'Kirkuk, Iraq',
      gender: 'Female',
      dateOfBirth: '1992-05-30',
      certificate: 'Bachelor of Education',
      age: 32,
      education: 'University of Mosul',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Biology',
      pass: 'Grade A',
      contract: 'Permanent'
    },
    {
      id: 'staff-5',
      fullName: 'Saman Jamal Aziz',
      mobile: '+964 753 654 3210',
      address: 'Erbil, Kurdistan Region',
      gender: 'Male',
      dateOfBirth: '1987-09-12',
      certificate: 'Master of Education',
      age: 37,
      education: 'American University of Kurdistan',
      attendance: 'Present',
      date: '2025-01-15',
      department: 'Physics',
      pass: 'Grade A+',
      contract: 'Permanent'
    }
  ])
  
  const [editingStaffRow, setEditingStaffRow] = useState(null)
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false)
  const [newStaffEntry, setNewStaffEntry] = useState({
    fullName: '',
    mobile: '',
    address: '',
    gender: '',
    dateOfBirth: '',
    certificate: '',
    age: '',
    education: '',
    attendance: 'Present',
    date: new Date().toISOString().split('T')[0],
    department: '',
    pass: '',
    contract: 'Permanent'
  })
  
  // Annual Installments State (قیستی ساڵانه)
  const [installmentsData, setInstallmentsData] = useState([
    {
      id: 'installment-1',
      fullName: 'احمد بابان قادریان',
      grade: 'ناچه‌',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1000000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1000000,
      remaining: 0
    },
    {
      id: 'installment-2',
      fullName: 'رضا ناظر کامیار',
      grade: 'kj2',
      installmentType: 'ناچه‌',
      annualAmount: 1000000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1000000,
      remaining: 0
    },
    {
      id: 'installment-3',
      fullName: 'ناوتۆن تانی عبدالکریم',
      grade: 'kj5',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1800000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1800000,
      remaining: 0
    },
    {
      id: 'installment-4',
      fullName: 'یاریان هاوژین صدیق',
      grade: '2',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1800000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1800000,
      remaining: 0
    },
    {
      id: 'installment-5',
      fullName: 'ئانا نەورۆز عبدالله',
      grade: '3',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1800000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1800000,
      remaining: 0
    },
    {
      id: 'installment-6',
      fullName: 'احمد عمر عبدالله',
      grade: '4',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1800000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1800000,
      remaining: 0
    },
    {
      id: 'installment-7',
      fullName: 'زهرا روژک قادر',
      grade: '5',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1800000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1800000,
      remaining: 0
    },
    {
      id: 'installment-8',
      fullName: 'دانا شێرکۆ محمد',
      grade: '6',
      installmentType: 'قۆناغیه‌تانه‌',
      annualAmount: 1800000,
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 1800000,
      remaining: 0
    }
  ])
  
  const [editingInstallmentRow, setEditingInstallmentRow] = useState(null)
  const [isAddInstallmentDialogOpen, setIsAddInstallmentDialogOpen] = useState(false)
  const [newInstallmentEntry, setNewInstallmentEntry] = useState({
    fullName: '',
    grade: '',
    installmentType: '',
    annualAmount: '',
    firstInstallment: 0,
    secondInstallment: 0,
    thirdInstallment: 0,
    fourthInstallment: 0,
    fifthInstallment: 0,
    sixthInstallment: 0,
    totalReceived: 0,
    remaining: 0
  })
  
  // Monthly Expenses State (خەرجی مانگانه)
  const [monthlyExpensesData, setMonthlyExpensesData] = useState([
    {
      id: 'expense-1',
      year: '2024',
      month: '9',
      staffSalary: 1791500,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 1791500,
      notes: ''
    },
    {
      id: 'expense-2',
      year: '2024',
      month: '10',
      staffSalary: 9127250,
      expenses: 2252250,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 875000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-3',
      year: '2024',
      month: '11',
      staffSalary: 9384750,
      expenses: 2373750,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 7011000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-4',
      year: '2024',
      month: '12',
      staffSalary: 8211250,
      expenses: 1278250,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 6933000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-5',
      year: '2025',
      month: '1',
      staffSalary: 11914000,
      expenses: 3464000,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 8450000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-6',
      year: '2025',
      month: '2',
      staffSalary: 9891750,
      expenses: 2867250,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 7500000,
      electricity: 7024500,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-7',
      year: '2025',
      month: '3',
      staffSalary: 0,
      expenses: 2896000,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 6845000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-8',
      year: '2025',
      month: '4',
      staffSalary: 0,
      expenses: 1836500,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 7310000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-9',
      year: '2025',
      month: '5',
      staffSalary: 0,
      expenses: 2340000,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 859000,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-10',
      year: '2025',
      month: '6',
      staffSalary: 0,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-11',
      year: '2025',
      month: '7',
      staffSalary: 0,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 0,
      notes: ''
    },
    {
      id: 'expense-12',
      year: '2025',
      month: '8',
      staffSalary: 0,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 0,
      notes: ''
    }
  ])
  
  const [editingExpenseRow, setEditingExpenseRow] = useState(null)
  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false)
  const [newExpenseEntry, setNewExpenseEntry] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    staffSalary: 0,
    expenses: 0,
    buildingRent: 0,
    dramaFee: 0,
    socialSupport: 0,
    electricity: 0,
    total: 0,
    notes: ''
  })
  
  // Daily Accounts State (حساباتی رۆژانه)
  const [dailyAccountsData, setDailyAccountsData] = useState([
    {
      id: 'daily-1',
      number: 1,
      week: 'W/1',
      purpose: 'باجی خزمەتگوزاری',
      checkNumber: 'C001',
      amount: 250000
    },
    {
      id: 'daily-2', 
      number: 2,
      week: 'W/1',
      purpose: 'کڕینی کەرەستەی نووسین',
      checkNumber: 'C002',
      amount: 75000
    },
    {
      id: 'daily-3',
      number: 3,
      week: 'W/2', 
      purpose: 'پارەی خوراک',
      checkNumber: 'C003',
      amount: 125000
    },
    {
      id: 'daily-4',
      number: 4,
      week: 'W/2',
      purpose: 'نۆرەی بینا',
      checkNumber: 'C004', 
      amount: 300000
    },
    {
      id: 'daily-5',
      number: 5,
      week: 'W/3',
      purpose: 'کارەبا',
      checkNumber: 'C005',
      amount: 180000
    }
  ])
  
  const [editingDailyAccountRow, setEditingDailyAccountRow] = useState(null)
  const [isAddDailyAccountDialogOpen, setIsAddDailyAccountDialogOpen] = useState(false)
  const [newDailyAccountEntry, setNewDailyAccountEntry] = useState({
    number: '',
    week: '',
    purpose: '',
    checkNumber: '',
    amount: 0
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [newEntry, setNewEntry] = useState({
    month: '',
    week1: ['', '', '', '', ''],
    week2: ['', '', '', '', ''],
    week3: ['', '', '', '', ''],
    week4: ['', '', '', '', '']
  })

  // Load data on component mount - try API but fall back to demo data
  useEffect(() => {
    // Demo data is already loaded in state, try to sync with API if available
    loadCalendarData()
    loadLegendData()
  }, [])

  const loadCalendarData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/calendar`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setCalendarData(data)
          console.log('Calendar data loaded from API:', data.length, 'entries')
        }
      }
    } catch (error) {
      console.log('API not available, using demo data')
    }
  }

  const loadLegendData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/legend`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        const data = await response.json()
        if (data.length > 0) {
          setLegendData(data)
          console.log('Legend data loaded from API:', data.length, 'entries')
        }
      }
    } catch (error) {
      console.log('API not available, using demo data')
    }
  }

  const saveEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'local-' + Date.now()
      }
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('local-') || entry.id.startsWith('sample-') ? 'POST' : 'PUT'
        const url = entry.id.startsWith('local-') || entry.id.startsWith('sample-') ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/calendar` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/calendar/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setCalendarData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })

      // Update legend with new abbreviations
      updateLocalLegend(entry)
      
      setIsAddDialogOpen(false)
      setEditingRow(null)
      resetNewEntry()
      
    } catch (error) {
      console.error('Error saving entry:', error)
    }
  }

  const updateLocalLegend = (entry) => {
    const allEntries = [...entry.week1, ...entry.week2, ...entry.week3, ...entry.week4]
    const allText = allEntries.join(' ')
    const abbreviations = allText.match(/[A-Z][A-Z0-9]*/g) || []
    
    abbreviations.forEach(abbr => {
      setLegendData(prevLegend => {
        const existingIndex = prevLegend.findIndex(item => item.abbreviation === abbr)
        if (existingIndex !== -1) {
          // Update usage count
          const newLegend = [...prevLegend]
          newLegend[existingIndex].usage_count += 1
          return newLegend
        } else {
          // Add new legend entry
          return [...prevLegend, {
            id: 'legend-' + Date.now() + '-' + abbr,
            abbreviation: abbr,
            full_description: `${abbr} - Please update description`,
            category: 'General',
            usage_count: 1
          }]
        }
      })
    })
  }

  const deleteEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/calendar/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting locally:', apiError.message)
      }

      // Remove from local state regardless
      setCalendarData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting entry:', error)
    }
  }

  const resetNewEntry = () => {
    setNewEntry({
      month: '',
      week1: ['', '', '', '', ''],
      week2: ['', '', '', '', ''],
      week3: ['', '', '', '', ''],
      week4: ['', '', '', '', '']
    })
  }

  const resetNewStaffEntry = () => {
    setNewStaffEntry({
      fullName: '',
      mobile: '',
      address: '',
      gender: '',
      dateOfBirth: '',
      marriage: '',
      certificate: '',
      age: '',
      education: '',
      attendance: 'Present',
      date: new Date().toISOString().split('T')[0],
      department: '',
      pass: '',
      contract: 'Permanent'
    })
  }

  const resetNewPayrollEntry = () => {
    setNewPayrollEntry({
      employeeName: '',
      salary: '',
      absence: 0,
      deduction: 0,
      bonus: 0,
      total: 0,
      notes: ''
    })
  }

  const resetNewSupervisionEntry = () => {
    setNewSupervisionEntry({
      teacherName: '',
      subject: '',
      teacherDepartment: '',
      teacherGrade: '',
      teacherViolationType: '',
      teacherPunishmentType: '',
      studentName: '',
      studentDepartment: '',
      studentGrade: '',
      studentViolationType: '',
      studentPunishmentType: ''
    })
  }

  // Payroll Management Functions
  const savePayrollEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'payroll-' + Date.now()
      }
      
      // Calculate total
      const salary = parseFloat(entry.salary) || 0
      const absence = parseFloat(entry.absence) || 0
      const deduction = parseFloat(entry.deduction) || 0
      const bonus = parseFloat(entry.bonus) || 0
      entry.total = salary - absence - deduction + bonus
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('payroll-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/payroll` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/payroll/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving payroll locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setPayrollData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddPayrollDialogOpen(false)
      setEditingPayrollRow(null)
      resetNewPayrollEntry()
      
    } catch (error) {
      console.error('Error saving payroll entry:', error)
    }
  }

  const deletePayrollEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/payroll/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting payroll locally:', apiError.message)
      }

      // Remove from local state regardless
      setPayrollData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting payroll entry:', error)
    }
  }

  const handlePayrollCellEdit = (rowIndex, field, value) => {
    const updatedData = [...payrollData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when salary, absence, deduction, or bonus changes
    if (['salary', 'absence', 'deduction', 'bonus'].includes(field)) {
      const salary = parseFloat(updatedData[rowIndex].salary) || 0
      const absence = parseFloat(updatedData[rowIndex].absence) || 0
      const deduction = parseFloat(updatedData[rowIndex].deduction) || 0
      const bonus = parseFloat(updatedData[rowIndex].bonus) || 0
      updatedData[rowIndex].total = salary - absence - deduction + bonus
    }
    
    setPayrollData(updatedData)
  }

  const startPayrollEditing = (index) => {
    setEditingPayrollRow(index)
  }

  const savePayrollRowEdit = async (rowIndex) => {
    const entry = payrollData[rowIndex]
    await savePayrollEntry(entry)
  }

  const cancelPayrollEdit = () => {
    setEditingPayrollRow(null)
    // Reload original data if needed
  }

  // Staff Management Functions
  const saveStaffEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'staff-' + Date.now()
      }
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('staff-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/staff` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/staff/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving staff locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setStaffData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddStaffDialogOpen(false)
      setEditingStaffRow(null)
      resetNewStaffEntry()
      
    } catch (error) {
      console.error('Error saving staff entry:', error)
    }
  }

  const deleteStaffEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/staff/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting staff locally:', apiError.message)
      }

      // Remove from local state regardless
      setStaffData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting staff entry:', error)
    }
  }

  const handleStaffCellEdit = (rowIndex, field, value) => {
    const updatedData = [...staffData]
    updatedData[rowIndex][field] = value
    setStaffData(updatedData)
  }

  const startStaffEditing = (index) => {
    setEditingStaffRow(index)
  }

  const saveStaffRowEdit = async (rowIndex) => {
    const entry = staffData[rowIndex]
    await saveStaffEntry(entry)
  }

  const cancelStaffEdit = () => {
    setEditingStaffRow(null)
    // Reload original data if needed
  }

  // Supervision Management Functions
  const saveSupervisionEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'supervision-' + Date.now()
      }
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('supervision-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/supervision` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/supervision/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving supervision locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setSupervisionData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddSupervisionDialogOpen(false)
      setEditingSupervisionRow(null)
      resetNewSupervisionEntry()
      
    } catch (error) {
      console.error('Error saving supervision entry:', error)
    }
  }

  const deleteSupervisionEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/supervision/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting supervision locally:', apiError.message)
      }

      // Remove from local state regardless
      setSupervisionData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting supervision entry:', error)
    }
  }

  const handleSupervisionCellEdit = (rowIndex, field, value) => {
    const updatedData = [...supervisionData]
    updatedData[rowIndex][field] = value
    setSupervisionData(updatedData)
  }

  const startSupervisionEditing = (index) => {
    setEditingSupervisionRow(index)
  }

  const saveSupervisionRowEdit = async (rowIndex) => {
    const entry = supervisionData[rowIndex]
    await saveSupervisionEntry(entry)
  }

  const cancelSupervisionEdit = () => {
    setEditingSupervisionRow(null)
    // Reload original data if needed
  }

  const handleCellEdit = (rowIndex, week, cellIndex, value) => {
    const updatedData = [...calendarData]
    updatedData[rowIndex][week][cellIndex] = value
    setCalendarData(updatedData)
  }

  const startEditing = (index) => {
    setEditingRow(index)
  }

  const saveRowEdit = async (rowIndex) => {
    const entry = calendarData[rowIndex]
    await saveEntry(entry)
  }

  const cancelEdit = () => {
    setEditingRow(null)
    loadCalendarData() // Reload original data
  }

  // Annual Installments Management Functions
  const saveInstallmentEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'installment-' + Date.now()
      }
      
      // Calculate totals
      const annualAmount = parseFloat(entry.annualAmount) || 0
      const first = parseFloat(entry.firstInstallment) || 0
      const second = parseFloat(entry.secondInstallment) || 0
      const third = parseFloat(entry.thirdInstallment) || 0
      const fourth = parseFloat(entry.fourthInstallment) || 0
      const fifth = parseFloat(entry.fifthInstallment) || 0
      const sixth = parseFloat(entry.sixthInstallment) || 0
      
      entry.totalReceived = first + second + third + fourth + fifth + sixth
      entry.remaining = annualAmount - entry.totalReceived
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('installment-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/installments` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/installments/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving installment locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setInstallmentsData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddInstallmentDialogOpen(false)
      setEditingInstallmentRow(null)
      resetNewInstallmentEntry()
      
    } catch (error) {
      console.error('Error saving installment entry:', error)
    }
  }

  const deleteInstallmentEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/installments/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting installment locally:', apiError.message)
      }

      // Remove from local state regardless
      setInstallmentsData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting installment entry:', error)
    }
  }

  const handleInstallmentCellEdit = (rowIndex, field, value) => {
    const updatedData = [...installmentsData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate totals when installment amounts change
    if (['annualAmount', 'firstInstallment', 'secondInstallment', 'thirdInstallment', 'fourthInstallment', 'fifthInstallment', 'sixthInstallment'].includes(field)) {
      const annualAmount = parseFloat(updatedData[rowIndex].annualAmount) || 0
      const first = parseFloat(updatedData[rowIndex].firstInstallment) || 0
      const second = parseFloat(updatedData[rowIndex].secondInstallment) || 0
      const third = parseFloat(updatedData[rowIndex].thirdInstallment) || 0
      const fourth = parseFloat(updatedData[rowIndex].fourthInstallment) || 0
      const fifth = parseFloat(updatedData[rowIndex].fifthInstallment) || 0
      const sixth = parseFloat(updatedData[rowIndex].sixthInstallment) || 0
      
      updatedData[rowIndex].totalReceived = first + second + third + fourth + fifth + sixth
      updatedData[rowIndex].remaining = annualAmount - updatedData[rowIndex].totalReceived
    }
    
    setInstallmentsData(updatedData)
  }

  const startInstallmentEditing = (index) => {
    setEditingInstallmentRow(index)
  }

  const saveInstallmentRowEdit = async (rowIndex) => {
    const entry = installmentsData[rowIndex]
    await saveInstallmentEntry(entry)
  }

  const cancelInstallmentEdit = () => {
    setEditingInstallmentRow(null)
    // Reload original data if needed
  }

  const resetNewInstallmentEntry = () => {
    setNewInstallmentEntry({
      fullName: '',
      grade: '',
      installmentType: '',
      annualAmount: '',
      firstInstallment: 0,
      secondInstallment: 0,
      thirdInstallment: 0,
      fourthInstallment: 0,
      fifthInstallment: 0,
      sixthInstallment: 0,
      totalReceived: 0,
      remaining: 0
    })
  }

  // Monthly Expenses Management Functions
  const saveExpenseEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'expense-' + Date.now()
      }
      
      // Calculate total
      const staffSalary = parseFloat(entry.staffSalary) || 0
      const expenses = parseFloat(entry.expenses) || 0
      const buildingRent = parseFloat(entry.buildingRent) || 0
      const dramaFee = parseFloat(entry.dramaFee) || 0
      const socialSupport = parseFloat(entry.socialSupport) || 0
      const electricity = parseFloat(entry.electricity) || 0
      
      entry.total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('expense-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/monthly-expenses` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/monthly-expenses/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving expense locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setMonthlyExpensesData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddExpenseDialogOpen(false)
      setEditingExpenseRow(null)
      resetNewExpenseEntry()
      
    } catch (error) {
      console.error('Error saving expense entry:', error)
    }
  }

  const deleteExpenseEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/monthly-expenses/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting expense locally:', apiError.message)
      }

      // Remove from local state regardless
      setMonthlyExpensesData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting expense entry:', error)
    }
  }

  const handleExpenseCellEdit = (rowIndex, field, value) => {
    const updatedData = [...monthlyExpensesData]
    updatedData[rowIndex][field] = value
    
    // Auto-calculate total when expense amounts change
    if (['staffSalary', 'expenses', 'buildingRent', 'dramaFee', 'socialSupport', 'electricity'].includes(field)) {
      const staffSalary = parseFloat(updatedData[rowIndex].staffSalary) || 0
      const expenses = parseFloat(updatedData[rowIndex].expenses) || 0
      const buildingRent = parseFloat(updatedData[rowIndex].buildingRent) || 0
      const dramaFee = parseFloat(updatedData[rowIndex].dramaFee) || 0
      const socialSupport = parseFloat(updatedData[rowIndex].socialSupport) || 0
      const electricity = parseFloat(updatedData[rowIndex].electricity) || 0
      
      updatedData[rowIndex].total = staffSalary + expenses + buildingRent + dramaFee + socialSupport + electricity
    }
    
    setMonthlyExpensesData(updatedData)
  }

  const startExpenseEditing = (index) => {
    setEditingExpenseRow(index)
  }

  const saveExpenseRowEdit = async (rowIndex) => {
    const entry = monthlyExpensesData[rowIndex]
    await saveExpenseEntry(entry)
  }

  const cancelExpenseEdit = () => {
    setEditingExpenseRow(null)
    // Reload original data if needed
  }

  const resetNewExpenseEntry = () => {
    setNewExpenseEntry({
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString(),
      staffSalary: 0,
      expenses: 0,
      buildingRent: 0,
      dramaFee: 0,
      socialSupport: 0,
      electricity: 0,
      total: 0,
      notes: ''
    })
  }

  // Daily Accounts Management Functions
  const saveDailyAccountEntry = async (entry) => {
    try {
      // Generate ID if it's a new entry
      if (!entry.id) {
        entry.id = 'daily-' + Date.now()
      }
      
      // Try to save to API first, but don't block on failure
      try {
        const method = entry.id.startsWith('daily-') && entry.id.includes(Date.now().toString().slice(-6)) ? 'POST' : 'PUT'
        const url = method === 'POST' ? 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/daily-accounts` : 
          `${process.env.NEXT_PUBLIC_API_URL || ''}/api/daily-accounts/${entry.id}`
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        })

        if (response.ok) {
          const savedEntry = await response.json()
          entry = savedEntry // Use the server response if successful
        }
      } catch (apiError) {
        console.log('API not available, saving daily account locally:', apiError.message)
      }

      // Update local state regardless of API success/failure
      setDailyAccountsData(prevData => {
        const existingIndex = prevData.findIndex(item => item.id === entry.id)
        if (existingIndex !== -1) {
          // Update existing entry
          const newData = [...prevData]
          newData[existingIndex] = entry
          return newData
        } else {
          // Add new entry
          return [...prevData, entry]
        }
      })
      
      setIsAddDailyAccountDialogOpen(false)
      setEditingDailyAccountRow(null)
      resetNewDailyAccountEntry()
      
    } catch (error) {
      console.error('Error saving daily account entry:', error)
    }
  }

  const deleteDailyAccountEntry = async (id) => {
    try {
      // Try to delete from API, but don't block on failure
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/daily-accounts/${id}`, { method: 'DELETE' })
      } catch (apiError) {
        console.log('API not available, deleting daily account locally:', apiError.message)
      }

      // Remove from local state regardless
      setDailyAccountsData(prevData => prevData.filter(item => item.id !== id))
    } catch (error) {
      console.error('Error deleting daily account entry:', error)
    }
  }

  const handleDailyAccountCellEdit = (rowIndex, field, value) => {
    const updatedData = [...dailyAccountsData]
    updatedData[rowIndex][field] = value
    setDailyAccountsData(updatedData)
  }

  const startDailyAccountEditing = (index) => {
    setEditingDailyAccountRow(index)
  }

  const saveDailyAccountRowEdit = async (rowIndex) => {
    const entry = dailyAccountsData[rowIndex]
    await saveDailyAccountEntry(entry)
  }

  const cancelDailyAccountEdit = () => {
    setEditingDailyAccountRow(null)
    // Reload original data if needed
  }

  const resetNewDailyAccountEntry = () => {
    setNewDailyAccountEntry({
      number: dailyAccountsData.length + 1,
      week: '',
      purpose: '',
      checkNumber: '',
      amount: 0
    })
  }

  const filteredData = calendarData.filter(entry =>
    entry.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
    [...entry.week1, ...entry.week2, ...entry.week3, ...entry.week4]
      .some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredLegend = legendData.filter(item =>
    item.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.full_description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDailyAccounts = dailyAccountsData.filter(entry =>
    entry.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.week.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const WeekCell = ({ value, onChange, readonly = false }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readonly}
      className={`min-w-[80px] w-full p-1 text-xs border rounded transition-colors ${readonly ? 'bg-gray-50 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'} ${!readonly ? 'border-blue-300 focus:border-blue-500' : 'border-gray-200'}`}
      placeholder={readonly ? '' : 'Enter codes...'}
    />
  )

  // CardView for calendar
  function CalendarCardView({ data }) {
  return (
      <div className="space-y-2">
        {data.map((entry, idx) => (
          <div key={entry.id} className="border rounded-lg p-2 bg-white shadow-sm">
            <div className="font-bold mb-1">{entry.month}</div>
            {["week1", "week2", "week3", "week4"].map((week, i) => (
              <div key={week} className="flex text-xs mb-1">
                <span className="font-semibold min-w-[2.5rem]">W/{i+1}:</span>
                <span className="ml-2 truncate">{entry[week].join(", ")}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              {/* کردارەکان (edit/delete) can be added here if needed */}
            </div>
          </div>
        ))}
      </div>
    );
  }
  // CardView for staff
  function StaffCardView({ data }) {
    return (
      <div className="space-y-2">
        {data.map((staff, idx) => (
          <div key={staff.id} className="border rounded-lg p-2 bg-white shadow-sm">
            <div className="font-bold mb-1">{staff.fullName}</div>
            <div className="text-xs"><span className="font-semibold">Mobile:</span> {staff.mobile}</div>
            <div className="text-xs"><span className="font-semibold">Address:</span> {staff.address}</div>
            <div className="text-xs"><span className="font-semibold">Gender:</span> {staff.gender}</div>
            <div className="text-xs"><span className="font-semibold">DOB:</span> {staff.dateOfBirth}</div>
            {/* Add more fields as needed */}
            <div className="flex gap-2 mt-2">
              {/* کردارەکان (edit/delete) can be added here if needed */}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function DailyAccountsCardView({ data }) {
    return (
      <div className="space-y-2">
        {data.map((account) => (
          <div key={account.id} className="border rounded-lg p-2 bg-white shadow-sm">
            <div className="font-bold mb-1">{account.purpose}</div>
            <div className="text-xs"><span className="font-semibold">ژمارە:</span> {account.number}</div>
            <div className="text-xs"><span className="font-semibold">هه‌فته‌:</span> {account.week}</div>
            <div className="text-xs"><span className="font-semibold">ژمارە پسووله‌:</span> {account.checkNumber}</div>
            <div className="text-xs"><span className="font-semibold">بڕی پارە:</span> {account.amount.toLocaleString()} د.ع</div>
            {/* کردارەکان can be added here if needed */}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-[1800px]">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-full">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Welcome back / بەخێربێیتەوە</p>
              <p className="font-semibold text-gray-800">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex items-center justify-center"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout / دەرچوون</span>
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">Berdoz Management System</h1>
        <p className="text-center text-gray-600">Calendar-based task and record management</p>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="calendar">بەڕێوەبردنی ساڵنامە</TabsTrigger>
          <TabsTrigger value="staff">تۆمارەکانی ستاف</TabsTrigger>
          <TabsTrigger value="payroll">لیستی بڕی موچە</TabsTrigger>
          <TabsTrigger value="supervision">چاودێری</TabsTrigger>
          <TabsTrigger value="installments">قیستی ساڵانه</TabsTrigger>
          <TabsTrigger value="monthly-expenses">خەرجی مانگانه</TabsTrigger>
          <TabsTrigger value="daily-accounts">حساباتی رۆژانه</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search calendar entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
                  <Plus className="h-4 w-4" />
                  زیادکردنی تۆمارێکی نوێ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Calendar Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="month">Month</Label>
                    <Input
                      id="month"
                      value={newEntry.month}
                      onChange={(e) => setNewEntry({...newEntry, month: e.target.value})}
                      placeholder="e.g., 1-Jun, 1-Jul, 1-Aug"
                    />
                  </div>
                  
                  {['week1', 'week2', 'week3', 'week4'].map((week, weekIndex) => (
                    <div key={week} className="space-y-2">
                      <Label>Week {weekIndex + 1}</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {newEntry[week].map((cell, cellIndex) => (
                          <Input
                            key={cellIndex}
                            value={cell}
                            onChange={(e) => {
                              const updated = {...newEntry}
                              updated[week][cellIndex] = e.target.value
                              setNewEntry(updated)
                            }}
                            placeholder={`Cell ${cellIndex + 1}`}
                            className="text-sm"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {setIsAddDialogOpen(false); resetNewEntry();}}>
                      Cancel
                    </Button>
                    <Button onClick={() => saveEntry(newEntry)}>
                      Save Entry
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Responsive Table/Card */}
          {isMobile ? (
            <CalendarCardView data={filteredData} />
          ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="border border-gray-300 p-1.5 px-2 text-left font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[60px]">Date</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">W/1</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">W/2</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">W/3</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">W/4</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[60px]">کردارەکان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((entry, rowIndex) => (
                      <tr key={entry.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-green-50 dark:bg-zinc-900'}>
                          <td className="border border-gray-300 p-1.5 px-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis">{entry.month}</td>
                          {["week1", "week2", "week3", "week4"].map((week) => (
                            <td key={week} className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                            <div className="grid grid-cols-1 gap-1">
                              {entry[week].map((cell, cellIndex) => (
                                <WeekCell
                                  key={cellIndex}
                                  value={cell}
                                  onChange={(value) => handleCellEdit(rowIndex, week, cellIndex, value)}
                                  readonly={editingRow !== rowIndex}
                                />
                              ))}
                            </div>
                          </td>
                        ))}
                          <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                          <div className="flex items-center justify-center gap-2">
                            {editingRow === rowIndex ? (
                              <>
                                <Button size="sm" variant="default" onClick={() => saveRowEdit(rowIndex)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startEditing(rowIndex)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          {/* Staff Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search تۆمارەکانی ستاف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
                  <Plus className="h-4 w-4" />
                  زیادکردنی تۆمارێکی نوێ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={newStaffEntry.fullName}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={newStaffEntry.mobile}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, mobile: e.target.value})}
                      placeholder="e.g., +964 750 123 4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStaffEntry.address}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      value={newStaffEntry.gender}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, gender: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newStaffEntry.dateOfBirth}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newStaffEntry.age}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, age: e.target.value})}
                      placeholder="Enter age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificate">Certificate</Label>
                    <Input
                      id="certificate"
                      value={newStaffEntry.certificate}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, certificate: e.target.value})}
                      placeholder="e.g., Bachelor of Education"
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Input
                      id="education"
                      value={newStaffEntry.education}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, education: e.target.value})}
                      placeholder="e.g., University of Baghdad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newStaffEntry.department}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, department: e.target.value})}
                      placeholder="e.g., Mathematics"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendance">Attendance</Label>
                    <select
                      id="attendance"
                      value={newStaffEntry.attendance}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, attendance: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">On Leave</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="pass">Grade/Pass</Label>
                    <Input
                      id="pass"
                      value={newStaffEntry.pass}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, pass: e.target.value})}
                      placeholder="e.g., Grade A+"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contract">Contract Type</Label>
                    <select
                      id="contract"
                      value={newStaffEntry.contract}
                      onChange={(e) => setNewStaffEntry({...newStaffEntry, contract: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {setIsAddStaffDialogOpen(false); resetNewStaffEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveStaffEntry(newStaffEntry)}>
                    Save Staff Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {/* Responsive Table/Card */}
          {isMobile ? (
            <StaffCardView data={staffData} />
          ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[120px]">ناوی تەواو</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">مۆبایل</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[100px]">ناونیشان</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">ڕەگەز</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[100px]">بەرواری لەدایک بوون</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">ژ.وەسەڵ</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[100px]">بروانامە</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">تەمەن</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[100px]">خوێندن</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">ئامادەبوون</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">بەروار</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">بەش</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">پاس</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[80px]">عەقد</th>
                        <th className="border border-gray-300 p-1.5 px-2 text-center font-semibold whitespace-nowrap overflow-hidden text-ellipsis min-w-[100px]">کردارەکان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData
                      .filter(staff =>
                        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        staff.mobile.includes(searchTerm) ||
                        staff.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        staff.address.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((staff, rowIndex) => (
                        <tr key={staff.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-green-50 dark:bg-zinc-900'}>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.fullName}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'fullName', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.fullName}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.mobile}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'mobile', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.mobile}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.address}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'address', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.address}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <select
                                value={staff.gender}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'gender', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            ) : staff.gender}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                type="date"
                                value={staff.dateOfBirth}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'dateOfBirth', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.dateOfBirth}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <select
                                value={staff.marriage}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'marriage', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              >
                                <option value="">Select</option>
                                <option value="Married">Married</option>
                                <option value="Single">Single</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                              </select>
                            ) : staff.marriage}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.certificate}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'certificate', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.certificate}</td>
                            <td className="border border-gray-300 p-1.5 px-2 text-center whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                type="number"
                                value={staff.age}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'age', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.age}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.education}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'education', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.education}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                                <select
                                  value={staff.attendance}
                                  onChange={(e) => handleStaffCellEdit(rowIndex, 'attendance', e.target.value)}
                                  className="bg-transparent border-none text-xs"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Leave">On Leave</option>
                                </select>
                            ) : staff.attendance}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                type="date"
                                value={staff.date}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'date', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.date}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.department}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'department', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.department}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                              <input
                                value={staff.pass}
                                onChange={(e) => handleStaffCellEdit(rowIndex, 'pass', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : staff.pass}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                                <select
                                  value={staff.contract}
                                  onChange={(e) => handleStaffCellEdit(rowIndex, 'contract', e.target.value)}
                                  className="bg-transparent border-none text-xs"
                                >
                                  <option value="Permanent">Permanent</option>
                                  <option value="Temporary">Temporary</option>
                                  <option value="Contract">Contract</option>
                                </select>
                            ) : staff.contract}</td>
                            <td className="border border-gray-300 p-1.5 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingStaffRow === rowIndex ? (
                                <>
                                  <Button size="sm" variant="default" onClick={() => saveStaffRowEdit(rowIndex)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelStaffEdit}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startStaffEditing(rowIndex)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteStaffEntry(staff.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                            )}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {/* Legend Display */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Legend (20 entries)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {legendData.map((item) => (
                    <div key={item.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="font-bold text-blue-600 text-lg">{item.abbreviation}</div>
                      <div className="text-sm text-gray-700 mt-1">{item.full_description}</div>
                      <div className="text-xs text-gray-500 mt-2">
                        Used {item.usage_count} times | Category: {item.category || 'General'}
                      </div>
                    </div>
                  ))}
                </div>
                {legendData.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    {legendData.length === 0 ? 
                      'No legend entries yet. Start adding calendar entries to build the legend automatically.' :
                      'No legend entries match your search.'
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <DetailedPayrollSection />
        </TabsContent>

        <TabsContent value="supervision" className="space-y-4">
          {/* Supervision Sub-tabs */}
          <Tabs defaultValue="teacher-supervision" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teacher-supervision">چاودێری مامۆستا (Teacher Supervision)</TabsTrigger>
              <TabsTrigger value="student-supervision">چاودێری خوێندکار (Student Supervision)</TabsTrigger>
            </TabsList>

            {/* Teacher Supervision Tab */}
            <TabsContent value="teacher-supervision" className="space-y-4">
              {/* Teacher Supervision Search and Add Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search چاودێری مامۆستا..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isAddSupervisionDialogOpen} onOpenChange={setIsAddSupervisionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
                      <Plus className="h-4 w-4" />
                      زیادکردنی تۆمارێکی نوێ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Teacher Supervision Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="teacherName">ناوی مامۆستا (Teacher Name)</Label>
                        <Input
                          id="teacherName"
                          value={newSupervisionEntry.teacherName}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, teacherName: e.target.value})}
                          placeholder="Enter teacher name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subject">بابەت (Subject)</Label>
                        <Input
                          id="subject"
                          value={newSupervisionEntry.subject}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, subject: e.target.value})}
                          placeholder="Enter subject"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacherDepartment">بەش (Department)</Label>
                        <Input
                          id="teacherDepartment"
                          value={newSupervisionEntry.teacherDepartment}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, teacherDepartment: e.target.value})}
                          placeholder="Enter department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacherGrade">قۆناخ (Grade)</Label>
                        <Input
                          id="teacherGrade"
                          value={newSupervisionEntry.teacherGrade}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, teacherGrade: e.target.value})}
                          placeholder="Enter grade level"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacherViolationType">جۆری سەرپێچی (Violation Type)</Label>
                        <Input
                          id="teacherViolationType"
                          value={newSupervisionEntry.teacherViolationType}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, teacherViolationType: e.target.value})}
                          placeholder="Enter violation type"
                        />
                      </div>
                      <div>
                        <Label htmlFor="teacherPunishmentType">جۆری سزا (Punishment Type)</Label>
                        <Input
                          id="teacherPunishmentType"
                          value={newSupervisionEntry.teacherPunishmentType}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, teacherPunishmentType: e.target.value})}
                          placeholder="Enter punishment type"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => {setIsAddSupervisionDialogOpen(false); resetNewSupervisionEntry();}}>
                        Cancel
                      </Button>
                      <Button onClick={() => saveSupervisionEntry(newSupervisionEntry)}>
                        Save Teacher Supervision Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Teacher Supervision Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-blue-600 text-white">
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ناوی مامۆستا</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">بابەت</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">بەش</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قۆناخ</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">جۆری سەرپێچی</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">جۆری سزا</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کردارەکان</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supervisionData
                          .filter(supervision =>
                            supervision.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supervision.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supervision.teacherDepartment.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((supervision, rowIndex) => (
                            <tr key={supervision.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-green-50 dark:bg-zinc-900'}>
                              {/* Teacher Supervision Columns */}
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.teacherName}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'teacherName', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                />
                              ) : supervision.teacherName}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.subject}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'subject', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                />
                              ) : supervision.subject}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.teacherDepartment}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'teacherDepartment', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                />
                              ) : supervision.teacherDepartment}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.teacherGrade}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'teacherGrade', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                />
                              ) : supervision.teacherGrade}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.teacherViolationType}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'teacherViolationType', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                />
                              ) : supervision.teacherViolationType}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.teacherPunishmentType}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'teacherPunishmentType', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                />
                              ) : supervision.teacherPunishmentType}</td>
                              
                              {/* کردارەکان Column */}
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                <div className="flex items-center justify-center gap-2">
                                  {editingSupervisionRow === rowIndex ? (
                                    <>
                                      <Button size="sm" variant="default" onClick={() => saveSupervisionRowEdit(rowIndex)}>
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={cancelSupervisionEdit}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => startSupervisionEditing(rowIndex)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => deleteSupervisionEntry(supervision.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Supervision Tab */}
            <TabsContent value="student-supervision" className="space-y-4">
              {/* Student Supervision Search and Add Controls */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search چاودێری خوێندکار..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Dialog open={isAddSupervisionDialogOpen} onOpenChange={setIsAddSupervisionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4" />
                      زیادکردنی تۆمارێکی نوێ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Student Supervision Entry</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="studentName">ناوی خوێندکار (Student Name)</Label>
                        <Input
                          id="studentName"
                          value={newSupervisionEntry.studentName}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, studentName: e.target.value})}
                          placeholder="Enter student name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studentDepartment">بەش (Department)</Label>
                        <Input
                          id="studentDepartment"
                          value={newSupervisionEntry.studentDepartment}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, studentDepartment: e.target.value})}
                          placeholder="Enter department"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studentGrade">قۆناخ (Grade)</Label>
                        <Input
                          id="studentGrade"
                          value={newSupervisionEntry.studentGrade}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, studentGrade: e.target.value})}
                          placeholder="Enter grade level"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studentViolationType">جۆری سەرپێچی (Violation Type)</Label>
                        <Input
                          id="studentViolationType"
                          value={newSupervisionEntry.studentViolationType}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, studentViolationType: e.target.value})}
                          placeholder="Enter violation type"
                        />
                      </div>
                      <div>
                        <Label htmlFor="studentPunishmentType">جۆری سزا (Punishment Type)</Label>
                        <Input
                          id="studentPunishmentType"
                          value={newSupervisionEntry.studentPunishmentType}
                          onChange={(e) => setNewSupervisionEntry({...newSupervisionEntry, studentPunishmentType: e.target.value})}
                          placeholder="Enter punishment type"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => {setIsAddSupervisionDialogOpen(false); resetNewSupervisionEntry();}}>
                        Cancel
                      </Button>
                      <Button onClick={() => saveSupervisionEntry(newSupervisionEntry)} className="bg-green-600 hover:bg-green-700">
                        Save Student Supervision Entry
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Student Supervision Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr className="bg-green-600 text-white">
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ناوی خوێندکار</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">بەش</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قۆناخ</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">جۆری سەرپێچی</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">جۆری سزا</th>
                          <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کردارەکان</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supervisionData
                          .filter(supervision =>
                            supervision.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            supervision.studentDepartment.toLowerCase().includes(searchTerm.toLowerCase())
                          )
                          .map((supervision, rowIndex) => (
                            <tr key={supervision.id} className={rowIndex % 2 === 0 ? 'bg-green-50 dark:bg-zinc-800' : 'bg-yellow-50 dark:bg-zinc-900'}>
                              {/* Student Supervision Columns */}
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.studentName}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'studentName', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-green-300 focus:border-green-500"
                                />
                              ) : supervision.studentName}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.studentDepartment}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'studentDepartment', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-green-300 focus:border-green-500"
                                />
                              ) : supervision.studentDepartment}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.studentGrade}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'studentGrade', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-green-300 focus:border-green-500"
                                />
                              ) : supervision.studentGrade}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.studentViolationType}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'studentViolationType', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-green-300 focus:border-green-500"
                                />
                              ) : supervision.studentViolationType}</td>
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">{editingSupervisionRow === rowIndex ? (
                                <input
                                  value={supervision.studentPunishmentType}
                                  onChange={(e) => handleSupervisionCellEdit(rowIndex, 'studentPunishmentType', e.target.value)}
                                  className="w-full p-1 text-xs border rounded border-green-300 focus:border-green-500"
                                />
                              ) : supervision.studentPunishmentType}</td>
                              
                              {/* کردارەکان Column */}
                              <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                <div className="flex items-center justify-center gap-2">
                                  {editingSupervisionRow === rowIndex ? (
                                    <>
                                      <Button size="sm" variant="default" onClick={() => saveSupervisionRowEdit(rowIndex)} className="bg-green-600 hover:bg-green-700">
                                        <Save className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={cancelSupervisionEdit}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => startSupervisionEditing(rowIndex)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => deleteSupervisionEntry(supervision.id)}>
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="installments" className="space-y-4">
          {/* Annual Installments Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search قیستی ساڵانه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddInstallmentDialogOpen} onOpenChange={setIsAddInstallmentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
                  <Plus className="h-4 w-4" />
                  زیادکردنی تۆمارێکی نوێ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Annual Installment Entry</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">ناوی تەواو (Full Name)</Label>
                    <Input
                      id="fullName"
                      value={newInstallmentEntry.fullName}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">پۆل (Grade)</Label>
                    <Input
                      id="grade"
                      value={newInstallmentEntry.grade}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, grade: e.target.value})}
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installmentType">جۆری قیست (Installment Type)</Label>
                    <Input
                      id="installmentType"
                      value={newInstallmentEntry.installmentType}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, installmentType: e.target.value})}
                      placeholder="Enter installment type"
                    />
                  </div>
                  <div>
                    <Label htmlFor="annualAmount">بڕی پارەی ساڵانە (Annual Amount)</Label>
                    <Input
                      id="annualAmount"
                      type="number"
                      value={newInstallmentEntry.annualAmount}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, annualAmount: e.target.value})}
                      placeholder="Enter annual amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstInstallment">قیستی یەکەم (First Installment)</Label>
                    <Input
                      id="firstInstallment"
                      type="number"
                      value={newInstallmentEntry.firstInstallment}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, firstInstallment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondInstallment">قیستی دووەم (Second Installment)</Label>
                    <Input
                      id="secondInstallment"
                      type="number"
                      value={newInstallmentEntry.secondInstallment}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, secondInstallment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thirdInstallment">قیستی سێیەم (Third Installment)</Label>
                    <Input
                      id="thirdInstallment"
                      type="number"
                      value={newInstallmentEntry.thirdInstallment}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, thirdInstallment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fourthInstallment">قیستی چوارەم (Fourth Installment)</Label>
                    <Input
                      id="fourthInstallment"
                      type="number"
                      value={newInstallmentEntry.fourthInstallment}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, fourthInstallment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fifthInstallment">قیستی پێنجەم (Fifth Installment)</Label>
                    <Input
                      id="fifthInstallment"
                      type="number"
                      value={newInstallmentEntry.fifthInstallment}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, fifthInstallment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sixthInstallment">قیستی شەشەم (Sixth Installment)</Label>
                    <Input
                      id="sixthInstallment"
                      type="number"
                      value={newInstallmentEntry.sixthInstallment}
                      onChange={(e) => setNewInstallmentEntry({...newInstallmentEntry, sixthInstallment: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {setIsAddInstallmentDialogOpen(false); resetNewInstallmentEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveInstallmentEntry(newInstallmentEntry)}>
                    Save Installment Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Annual Installments Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ز</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ناوی تەواو</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">پۆل</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">جۆری قیست</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">بڕی پارەی ساڵانە</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قیستی یەکەم</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قیستی دووەم</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قیستی سێیەم</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قیستی چوارەم</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قیستی پێنجەم</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">قیستی شەشەم</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">بڕی وەرگیراو</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">چەندی ماوە</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کردارەکان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {installmentsData
                      .filter(installment =>
                        installment.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        installment.grade.includes(searchTerm) ||
                        installment.installmentType.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((installment, rowIndex) => (
                        <tr key={installment.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'}>
                          <td className="border border-gray-300 p-1 px-2 font-medium">{rowIndex + 1}</td>
                          <td className="border border-gray-300 p-1 px-2">{editingInstallmentRow === rowIndex ? (
                            <input
                              value={installment.fullName}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'fullName', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.fullName}</td>
                          <td className="border border-gray-300 p-1 px-2">{editingInstallmentRow === rowIndex ? (
                            <input
                              value={installment.grade}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'grade', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.grade}</td>
                          <td className="border border-gray-300 p-1 px-2">{editingInstallmentRow === rowIndex ? (
                            <input
                              value={installment.installmentType}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'installmentType', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.installmentType}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.annualAmount}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'annualAmount', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.annualAmount.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.firstInstallment}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'firstInstallment', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.firstInstallment.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.secondInstallment}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'secondInstallment', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.secondInstallment.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.thirdInstallment}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'thirdInstallment', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.thirdInstallment.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.fourthInstallment}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'fourthInstallment', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.fourthInstallment.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.fifthInstallment}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'fifthInstallment', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.fifthInstallment.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingInstallmentRow === rowIndex ? (
                            <input
                              type="number"
                              value={installment.sixthInstallment}
                              onChange={(e) => handleInstallmentCellEdit(rowIndex, 'sixthInstallment', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : installment.sixthInstallment.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center font-medium text-green-600">{installment.totalReceived.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center font-medium text-red-600">{installment.remaining.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                            <div className="flex items-center justify-center gap-2">
                              {editingInstallmentRow === rowIndex ? (
                                <>
                                  <Button size="sm" variant="default" onClick={() => saveInstallmentRowEdit(rowIndex)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelInstallmentEdit}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startInstallmentEditing(rowIndex)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteInstallmentEntry(installment.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly-expenses" className="space-y-4">
          {/* Monthly Expenses Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search خەرجی مانگانه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
                  <Plus className="h-4 w-4" />
                  زیادکردنی تۆمارێکی نوێ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Monthly Expense Entry</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">ساڵ (Year)</Label>
                    <Input
                      id="year"
                      value={newExpenseEntry.year}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, year: e.target.value})}
                      placeholder="Enter year"
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">مانگ (Month)</Label>
                    <select
                      id="month"
                      value={newExpenseEntry.month}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, month: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="1">January - کانونی دووەم</option>
                      <option value="2">February - شوبات</option>
                      <option value="3">March - ئازار</option>
                      <option value="4">April - نیسان</option>
                      <option value="5">May - ئایار</option>
                      <option value="6">June - حوزەیران</option>
                      <option value="7">July - تەمووز</option>
                      <option value="8">August - ئاب</option>
                      <option value="9">September - ئەیلوول</option>
                      <option value="10">October - تشرینی یەکەم</option>
                      <option value="11">November - تشرینی دووەم</option>
                      <option value="12">December - کانونی یەکەم</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="staffSalary">موچەی ستاف (Staff Salary)</Label>
                    <Input
                      id="staffSalary"
                      type="number"
                      value={newExpenseEntry.staffSalary}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, staffSalary: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses">مەسروفات (Expenses)</Label>
                    <Input
                      id="expenses"
                      type="number"
                      value={newExpenseEntry.expenses}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, expenses: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buildingRent">کرێی بینا (Building Rent)</Label>
                    <Input
                      id="buildingRent"
                      type="number"
                      value={newExpenseEntry.buildingRent}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, buildingRent: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dramaFee">باجی درامەت (Drama Fee)</Label>
                    <Input
                      id="dramaFee"
                      type="number"
                      value={newExpenseEntry.dramaFee}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, dramaFee: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="socialSupport">دەستەبەری کۆمەڵایەتی (Social Support)</Label>
                    <Input
                      id="socialSupport"
                      type="number"
                      value={newExpenseEntry.socialSupport}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, socialSupport: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="electricity">کارەبا (Electricity)</Label>
                    <Input
                      id="electricity"
                      type="number"
                      value={newExpenseEntry.electricity}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, electricity: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="notes">تێبینی (Notes)</Label>
                    <Textarea
                      id="notes"
                      value={newExpenseEntry.notes}
                      onChange={(e) => setNewExpenseEntry({...newExpenseEntry, notes: e.target.value})}
                      placeholder="Enter notes..."
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {setIsAddExpenseDialogOpen(false); resetNewExpenseEntry();}}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveExpenseEntry(newExpenseEntry)}>
                    Save Expense Entry
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Monthly Expenses Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ساڵ</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">مانگ</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">موچەی ستاف</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">مەسروفات</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کرێی بینا</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">باجی درامەت</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">دەستەبەری کۆمەڵایەتی</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کارەبا</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کۆی گشتی</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">تێبینی</th>
                      <th className="border border-gray-300 p-1 px-2 font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کردارەکان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyExpensesData
                      .filter(expense =>
                        expense.year.includes(searchTerm) ||
                        expense.month.includes(searchTerm) ||
                        expense.notes.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((expense, rowIndex) => (
                        <tr key={expense.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'}>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingExpenseRow === rowIndex ? (
                            <input
                              value={expense.year}
                              onChange={(e) => handleExpenseCellEdit(rowIndex, 'year', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : expense.year}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingExpenseRow === rowIndex ? (
                            <select
                              value={expense.month}
                              onChange={(e) => handleExpenseCellEdit(rowIndex, 'month', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            >
                              {Array.from({length: 12}, (_, i) => (
                                <option key={i+1} value={i+1}>{i+1}</option>
                              ))}
                            </select>
                          ) : expense.month}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingExpenseRow === rowIndex ? (
                            <input
                              type="number"
                              value={expense.staffSalary}
                              onChange={(e) => handleExpenseCellEdit(rowIndex, 'staffSalary', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : expense.staffSalary.toLocaleString()}</td>
                          <td className="border border-gray-300 p-1 px-2 text-center">{editingExpenseRow === rowIndex ? (
                            <input
                              type="number"
                              value={expense.expenses}
                              onChange={(e) => handleExpenseCellEdit(rowIndex, 'expenses', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : expense.expenses.toLocaleString()}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            {editingExpenseRow === rowIndex ? (
                              <input
                                type="number"
                                value={expense.buildingRent}
                                onChange={(e) => handleExpenseCellEdit(rowIndex, 'buildingRent', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : expense.buildingRent.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {editingExpenseRow === rowIndex ? (
                              <input
                                type="number"
                                value={expense.dramaFee}
                                onChange={(e) => handleExpenseCellEdit(rowIndex, 'dramaFee', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : expense.dramaFee.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {editingExpenseRow === rowIndex ? (
                              <input
                                type="number"
                                value={expense.socialSupport}
                                onChange={(e) => handleExpenseCellEdit(rowIndex, 'socialSupport', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : expense.socialSupport.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {editingExpenseRow === rowIndex ? (
                              <input
                                type="number"
                                value={expense.electricity}
                                onChange={(e) => handleExpenseCellEdit(rowIndex, 'electricity', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                              />
                            ) : expense.electricity.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-2 text-center font-medium text-green-600">
                            {expense.total.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {editingExpenseRow === rowIndex ? (
                              <textarea
                                value={expense.notes}
                                onChange={(e) => handleExpenseCellEdit(rowIndex, 'notes', e.target.value)}
                                className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                                rows={2}
                              />
                            ) : expense.notes}
                          </td>
                          <td className="border border-gray-300 p-3">
                            <div className="flex items-center justify-center gap-2">
                              {editingExpenseRow === rowIndex ? (
                                <>
                                  <Button size="sm" variant="default" onClick={() => saveExpenseRowEdit(rowIndex)}>
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelExpenseEdit}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => startExpenseEditing(rowIndex)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => deleteExpenseEntry(expense.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily-accounts" className="space-y-4">
          {/* Daily Accounts Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="گەڕان لە حساباتی رۆژانه..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddDailyAccountDialogOpen} onOpenChange={setIsAddDailyAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 dark:text-gray-900">
                  <Plus className="h-4 w-4" />
                  زیادکردنی تۆمارێکی نوێ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>زیادکردنی حسابی رۆژانه</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="number">ژمارە</Label>
                    <Input
                      id="number"
                      type="number"
                      value={newDailyAccountEntry.number}
                      onChange={(e) => setNewDailyAccountEntry({...newDailyAccountEntry, number: parseInt(e.target.value)})}
                      placeholder="ژمارەی تۆمار"
                    />
                  </div>
                  <div>
                    <Label htmlFor="week">هه‌فته‌</Label>
                    <select
                      id="week"
                      value={newDailyAccountEntry.week}
                      onChange={(e) => setNewDailyAccountEntry({...newDailyAccountEntry, week: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="">هه‌ڵبژاردنی هه‌فته‌</option>
                      <option value="W/1">W/1</option>
                      <option value="W/2">W/2</option>
                      <option value="W/3">W/3</option>
                      <option value="W/4">W/4</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="purpose">مەبەست</Label>
                    <Input
                      id="purpose"
                      value={newDailyAccountEntry.purpose}
                      onChange={(e) => setNewDailyAccountEntry({...newDailyAccountEntry, purpose: e.target.value})}
                      placeholder="مەبەستی پارەدان"
                    />
                  </div>
                  <div>
                    <Label htmlFor="checkNumber">ژمارە پسووله‌</Label>
                    <Input
                      id="checkNumber"
                      value={newDailyAccountEntry.checkNumber}
                      onChange={(e) => setNewDailyAccountEntry({...newDailyAccountEntry, checkNumber: e.target.value})}
                      placeholder="ژمارەی پسووله‌"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="amount">بڕی پارە</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={newDailyAccountEntry.amount}
                      onChange={(e) => setNewDailyAccountEntry({...newDailyAccountEntry, amount: parseFloat(e.target.value) || 0})}
                      placeholder="بڕی پارە بە دینار"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => {setIsAddDailyAccountDialogOpen(false); resetNewDailyAccountEntry();}}>
                    هەڵوەشاندنەوە
                  </Button>
                  <Button onClick={() => saveDailyAccountEntry(newDailyAccountEntry)}>
                    پاشەکەوتکردن
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Daily Accounts Table */}
          {isMobile ? (
            <DailyAccountsCardView data={filteredDailyAccounts} />
          ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-right">حساباتی رۆژانه</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-gray-300 p-1 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ژمارە</th>
                      <th className="border border-gray-300 p-1 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis">هه‌فته‌</th>
                      <th className="border border-gray-300 p-1 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis">مەبەست</th>
                      <th className="border border-gray-300 p-1 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis">ژمارە پسووله‌</th>
                      <th className="border border-gray-300 p-1 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis">بڕی پارە</th>
                      <th className="border border-gray-300 p-1 px-2 text-right font-semibold whitespace-nowrap overflow-hidden text-ellipsis">کردارەکان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDailyAccounts.map((account, rowIndex) => (
                      <tr key={account.id} className={rowIndex % 2 === 0 ? 'bg-blue-50 dark:bg-zinc-800' : 'bg-green-50 dark:bg-zinc-900'}>
                        <td className="border border-gray-300 p-1 px-2 text-right font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {editingDailyAccountRow === rowIndex ? (
                            <input
                              type="number"
                              value={account.number}
                              onChange={(e) => handleDailyAccountCellEdit(rowIndex, 'number', parseInt(e.target.value))}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : account.number}
                        </td>
                        <td className="border border-gray-300 p-1 px-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">
                          {editingDailyAccountRow === rowIndex ? (
                            <select
                              value={account.week}
                              onChange={(e) => handleDailyAccountCellEdit(rowIndex, 'week', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            >
                              <option value="W/1">W/1</option>
                              <option value="W/2">W/2</option>
                              <option value="W/3">W/3</option>
                              <option value="W/4">W/4</option>
                            </select>
                          ) : account.week}
                        </td>
                        <td className="border border-gray-300 p-1 px-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">
                          {editingDailyAccountRow === rowIndex ? (
                            <input
                              type="text"
                              value={account.purpose}
                              onChange={(e) => handleDailyAccountCellEdit(rowIndex, 'purpose', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : account.purpose}
                        </td>
                        <td className="border border-gray-300 p-1 px-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">
                          {editingDailyAccountRow === rowIndex ? (
                            <input
                              type="text"
                              value={account.checkNumber}
                              onChange={(e) => handleDailyAccountCellEdit(rowIndex, 'checkNumber', e.target.value)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : account.checkNumber}
                        </td>
                        <td className="border border-gray-300 p-1 px-2 text-right font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                          {editingDailyAccountRow === rowIndex ? (
                            <input
                              type="number"
                              value={account.amount}
                              onChange={(e) => handleDailyAccountCellEdit(rowIndex, 'amount', parseFloat(e.target.value) || 0)}
                              className="w-full p-1 text-xs border rounded border-blue-300 focus:border-blue-500"
                            />
                          ) : account.amount.toLocaleString()} د.ع
                        </td>
                        <td className="border border-gray-300 p-1 px-2">
                          <div className="flex items-center justify-center gap-2">
                            {editingDailyAccountRow === rowIndex ? (
                              <>
                                <Button size="sm" variant="default" onClick={() => saveDailyAccountRowEdit(rowIndex)}>
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelDailyAccountEdit}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => startDailyAccountEditing(rowIndex)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => deleteDailyAccountEntry(account.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default BerdozManagementSystem