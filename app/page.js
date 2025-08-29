'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogOut, User, Calendar, Users, DollarSign, Shield, CreditCard, Receipt, FileText, Building2, ChefHat, GraduationCap, UserX, FileCheck, Activity, ClipboardCheck, Search, ChevronDown, ChevronRight, Bus } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [expandedSections, setExpandedSections] = useState({
    0: false, // Administration & Activity - closed by default
    1: false, // Teacher Management
    2: false, // Student Management  
    3: false, // Finance & Expenses
    4: false  // Utility
  })
  const [clickAnimation, setClickAnimation] = useState({})

  const toggleSection = (sectionIndex) => {
    // Add click animation effect
    setClickAnimation({ [sectionIndex]: true })
    setTimeout(() => setClickAnimation({}), 150)
    
    setExpandedSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }))
  }

  const handleLogout = () => {
    logout()
  }

  const modulesSections = [
    {
      title: '📅 Administration & Activity',
      titleKurdish: 'بەڕێوەبردن و چالاکیەکان',
      modules: [
        {
          title: 'بەڕێوەبردنی ساڵنامە',
          subtitle: 'Calendar Management',
          icon: Calendar,
          href: '/calendar',
          description: 'Task organization and scheduling'
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
          title: 'چاودێری',
          subtitle: 'Supervision System',
          icon: Shield,
          href: '/supervision',
          description: 'Teacher and student monitoring'
        },
        {
          title: 'پاس',
          subtitle: 'Bus Management',
          icon: Bus,
          href: '/bus',
          description: 'Bus transportation management for students, teachers, and drivers'
        }
      ]
    },
    {
      title: '👥 Teacher Management',
      titleKurdish: 'بەڕێوەبردنی مامۆستایان',
      modules: [
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
          title: 'مۆڵەتی مامۆستا',
          subtitle: 'Teacher Leaves',
          icon: UserX,
          href: '/employee-leaves',
          description: 'Teacher leave management and tracking'
        },
        {
          title: 'مۆڵەتی فەرمانبەر',
          subtitle: 'Officer Leaves',
          icon: UserX,
          href: '/officer-leaves',
          description: 'Officer leave management and tracking'
        }
      ]
    },
    {
      title: '🎓 Student Management',
      titleKurdish: 'بەڕێوەبردنی قوتابیان',
      modules: [
        {
          title: 'مۆڵەت',
          subtitle: 'Student Permissions',
          icon: FileCheck,
          href: '/student-permissions',
          description: 'Student leave and permission management'
        },
        {
          title: 'قوتابیی چاودێری کراو',
          subtitle: 'Supervised Students',
          icon: Users,
          href: '/supervised-students',
          description: 'Student supervision and disciplinary records'
        }
      ]
    },
    {
      title: '💰 Finance & Expenses',
      titleKurdish: 'دارایی و خەرجیەکان',
      modules: [
        {
          title: 'لیستی بڕی موچە',
          subtitle: 'Payroll Management',
          icon: DollarSign,
          href: '/payroll',
          description: 'Salary processing and compensation tracking'
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
        }
      ]
    },
    {
      title: '🔍 Utility',
      titleKurdish: 'بەکارهاتووەکان',
      modules: [
        {
          title: 'گەرانی گشتی',
          subtitle: 'General Search',
          icon: Search,
          href: '/general-search',
          description: 'Search across all database records'
        }
      ]
    }
  ]

  return (
    <div className="container mx-auto p-2 sm:p-4 max-w-7xl pb-16 overflow-x-visible">
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
              className="flex items-center space-x-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-600 transition-all duration-200 hover:shadow-lg hover:scale-105 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
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

      {/* Modern Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-2 sm:px-4 pb-20 overflow-visible">
        {modulesSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="group">
            {/* Modern Section Card */}
            <div 
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 transform-gpu ${
                clickAnimation[sectionIndex] ? 'scale-95' : ''
              }`}
              onClick={() => toggleSection(sectionIndex)}
            >
              {/* Main Section Card */}
              <div className="relative p-8 bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/80 dark:from-gray-800 dark:via-blue-900/30 dark:to-indigo-900/50 rounded-3xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-blue-300 dark:group-hover:border-blue-500 backdrop-blur-sm">
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon Section */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300" role="img" aria-label="section-icon">
                          {section.title.split(' ')[0]}
                        </div>
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                      </div>
                      
                      {/* Module Count Badge */}
                      <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700">
                        {section.modules.length} modules
                      </div>
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="p-2 bg-white/60 dark:bg-gray-700/60 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 backdrop-blur-sm">
                      {expandedSections[sectionIndex] ? 
                        <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-300 transition-transform duration-300" /> : 
                        <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-300 transition-transform duration-300" />
                      }
                    </div>
                  </div>
                  
                  {/* Title Section */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 dark:from-gray-200 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left">
                      {section.title.substring(section.title.indexOf(' ') + 1)}
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                      {section.titleKurdish}
                    </p>
                  </div>
                  
                    {/* Quick Stats */}
                  <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-2">
                      <span>Click to explore</span>
                      {expandedSections[sectionIndex] && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 animate-pulse">
                          ✓ Expanded
                        </span>
                      )}
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-300 ${
                          expandedSections[sectionIndex] 
                            ? 'opacity-100 animate-bounce' 
                            : 'opacity-50 group-hover:opacity-100'
                        }`} style={{animationDelay: `${i * 0.1}s`}}></div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 p-0.5">
                    <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Expandable Modules Section */}
            <div className={`transition-all duration-300 ease-out ${
              expandedSections[sectionIndex] 
                ? 'max-h-screen opacity-100 transform translate-y-0 mt-10' 
                : 'max-h-0 opacity-0 transform -translate-y-4 overflow-hidden'
            }`}>
              <div className="space-y-8">
                {section.modules.map((module, moduleIndex) => {
                  const IconComponent = module.icon
                  return (
                    <Link key={module.href} href={module.href}>
                      <div className={`group/module p-6 ${moduleIndex === 0 ? 'mt-6' : 'mt-4'} bg-gradient-to-r from-white via-gray-50/50 to-blue-50/30 dark:from-gray-800 dark:via-gray-800/80 dark:to-blue-900/20 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-xl transition-all duration-200 hover:scale-[1.03] transform-gpu backdrop-blur-sm hover:bg-gradient-to-r hover:from-blue-50/90 hover:to-indigo-50/90 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 hover:border-blue-300/70 dark:hover:border-blue-500/70 mx-2 sm:mx-0`}>
                        <div className="flex items-center space-x-5">
                          <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-xl group-hover/module:scale-110 group-hover/module:rotate-3 transition-all duration-200 shadow-md group-hover/module:shadow-lg">
                            <IconComponent className="h-7 w-7 text-blue-600 dark:text-blue-400 group-hover/module:text-blue-700 dark:group-hover/module:text-blue-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover/module:text-blue-700 dark:group-hover/module:text-blue-300 transition-colors duration-200 truncate mb-1" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                              {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 group-hover/module:text-gray-700 dark:group-hover/module:text-gray-300 transition-colors duration-200">
                              {module.subtitle}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 group-hover/module:text-gray-600 dark:group-hover/module:text-gray-400 transition-colors duration-200">
                              {module.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-center space-y-2">
                            <div className="p-2 bg-blue-100/70 dark:bg-blue-900/40 rounded-full group-hover/module:bg-blue-200 dark:group-hover/module:bg-blue-800/60 transition-all duration-200">
                              <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover/module:text-blue-700 dark:group-hover/module:text-blue-300 group-hover/module:translate-x-1 transition-all duration-200" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Hover Effect Border */}
                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/module:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 blur-sm"></div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 pb-12 text-center text-gray-500 dark:text-gray-400 transition-colors duration-300">
        <p className="flex items-center justify-center gap-2">
          Built with 
          <span className="text-red-500 dark:text-red-400 animate-pulse text-lg">❤️</span> 
          for Kurdish Educational Institutions
        </p>
      </div>
    </div>
  )
}