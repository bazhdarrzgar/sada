'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogOut, User, Calendar, Users, DollarSign, Shield, CreditCard, Receipt, FileText, Building2, ChefHat, GraduationCap, UserX, FileCheck, Activity, ClipboardCheck, Search } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? / دڵنیایت لە دەرچوون؟')) {
      logout()
    }
  }

  const modules = [
    {
      title: 'بەڕێوەبردنی ساڵنامە',
      subtitle: 'Calendar Management',
      icon: Calendar,
      href: '/calendar',
      description: 'Task organization and scheduling'
    },
    {
      title: 'تۆمارەکانی ستاف',
      subtitle: 'Staff Records',
      icon: Users,
      href: '/staff',
      description: 'Employee information and HR management'
    },
    {
      title: 'تۆماری مامۆستایان',
      subtitle: 'Teachers Records',
      icon: GraduationCap,
      href: '/teachers',
      description: 'Teachers information and academic records'
    },
    {
      title: 'زانیاری مامۆستا',
      subtitle: 'Teacher Information',
      icon: GraduationCap,
      href: '/teacher-info',
      description: 'Teacher political names and subjects information'
    },
    {
      title: 'لیستی بڕی موچە',
      subtitle: 'Payroll Management',
      icon: DollarSign,
      href: '/payroll',
      description: 'Salary processing and compensation tracking'
    },
    {
      title: 'چالاکی',
      subtitle: 'Activities Management',
      icon: Activity,
      href: '/activities',
      description: 'School activities and events planning'
    },
    {
      title: 'چاودێریکردنی تاقیرکدنەوە',
      subtitle: 'Exam Supervision',
      icon: ClipboardCheck,
      href: '/exam-supervision',
      description: 'Exam supervision and results management'
    },
    {
      title: 'مۆڵەت',
      subtitle: 'Student Permissions',
      icon: FileCheck,
      href: '/student-permissions',
      description: 'Student leave and permission management'
    },
    {
      title: 'مۆڵەتی فەرمانبەران',
      subtitle: 'Employee Leaves',
      icon: UserX,
      href: '/employee-leaves',
      description: 'Employee leave management and tracking'
    },
    {
      title: 'چاودێری',
      subtitle: 'Supervision System',
      icon: Shield,
      href: '/supervision',
      description: 'Teacher and student monitoring'
    },
    {
      title: 'خوێندکاری چاودێری کراو',
      subtitle: 'Supervised Students',
      icon: Users,
      href: '/supervised-students',
      description: 'Student supervision and disciplinary records'
    },
    {
      title: 'قیستی ساڵانه',
      subtitle: 'Annual Installments',
      icon: CreditCard,
      href: '/installments',
      description: 'Student payment and installment tracking'
    },
    {
      title: 'خەرجی مانگانه',
      subtitle: 'Monthly Expenses',
      icon: Receipt,
      href: '/expenses',
      description: 'Institutional expense management'
    },
    {
      title: 'مەسروفی بینا',
      subtitle: 'Building Expenses',
      icon: Building2,
      href: '/building-expenses',
      description: 'Building-related expense tracking'
    },
    {
      title: 'حساباتی رۆژانه',
      subtitle: 'Daily Accounts',
      icon: FileText,
      href: '/daily-accounts',
      description: 'Daily financial transaction records'
    },
    {
      title: 'خەرجی خواردنگە',
      subtitle: 'Kitchen Expenses',
      icon: ChefHat,
      href: '/kitchen-expenses',
      description: 'Kitchen and food expense management'
    },
    {
      title: 'گەرانی گشتی',
      subtitle: 'General Search',
      icon: Search,
      href: '/general-search',
      description: 'Search across all database records'
    }
  ]

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Welcome back / بەخێربێیتەوە</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 transition-colors duration-300">{user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-all duration-300 hover:shadow-md group"
            >
              <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
              <span>Logout / دەرچوون</span>
            </Button>
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent transition-all duration-300">
            Berdoz Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Comprehensive management system for educational institutions</p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon
          return (
            <Link key={module.href} href={module.href}>
              <Card className="theme-card h-full glow-button hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 group">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                      <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-300" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-center mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                    {module.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium text-center group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
                    {module.subtitle}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <p className="flex items-center justify-center gap-2">
          Built with 
          <span className="text-red-500 dark:text-red-400 animate-pulse text-lg">❤️</span> 
          for Kurdish Educational Institutions
        </p>
      </div>
    </div>
  )
}