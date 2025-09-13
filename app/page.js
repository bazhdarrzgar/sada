'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { useProfile } from '@/components/profile/ProfileContext'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle, useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import { LogOut, User, Calendar, Users, DollarSign, Shield, CreditCard, Receipt, FileText, Building2, ChefHat, GraduationCap, UserX, FileCheck, Activity, ClipboardCheck, Search, ChevronDown, ChevronRight, Bus } from 'lucide-react'
import Link from 'next/link'
import MainNavigation from '@/components/navigation/MainNavigation'
import ProfileManager from '@/components/profile/ProfileManager'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { profile } = useProfile()
  const { language } = useLanguage()
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
      title: '📅 ' + t('dashboard.sections.administration.title', language),
      titleKurdish: t('dashboard.sections.administration.title', 'kurdish'),
      modules: [
        {
          title: t('dashboard.modules.calendarManagement.title', 'kurdish'),
          subtitle: t('dashboard.modules.calendarManagement.title', language),
          icon: Calendar,
          href: '/calendar',
          description: t('dashboard.modules.calendarManagement.description', language)
        },
        {
          title: t('dashboard.modules.activities.title', 'kurdish'),
          subtitle: t('dashboard.modules.activities.title', language),
          icon: Activity,
          href: '/activities',
          description: t('dashboard.modules.activities.description', language)
        },
        {
          title: t('dashboard.modules.examSupervision.title', 'kurdish'),
          subtitle: t('dashboard.modules.examSupervision.title', language),
          icon: ClipboardCheck,
          href: '/exam-supervision',
          description: t('dashboard.modules.examSupervision.description', language)
        },
        {
          title: t('dashboard.modules.supervision.title', 'kurdish'),
          subtitle: t('dashboard.modules.supervision.title', language),
          icon: Shield,
          href: '/supervision',
          description: t('dashboard.modules.supervision.description', language)
        },
        {
          title: t('dashboard.modules.busManagement.title', 'kurdish'),
          subtitle: t('dashboard.modules.busManagement.title', language),
          icon: Bus,
          href: '/bus',
          description: t('dashboard.modules.busManagement.description', language)
        }
      ]
    },
    {
      title: '👥 ' + t('dashboard.sections.teacherManagement.title', language),
      titleKurdish: t('dashboard.sections.teacherManagement.title', 'kurdish'),
      modules: [
        {
          title: t('dashboard.modules.staffRecords.title', 'kurdish'),
          subtitle: t('dashboard.modules.staffRecords.title', language),
          icon: Users,
          href: '/staff',
          description: t('dashboard.modules.staffRecords.description', language)
        },
        {
          title: t('dashboard.modules.teachersRecords.title', 'kurdish'),
          subtitle: t('dashboard.modules.teachersRecords.title', language),
          icon: GraduationCap,
          href: '/teachers',
          description: t('dashboard.modules.teachersRecords.description', language)
        },
        {
          title: t('dashboard.modules.teacherInfo.title', 'kurdish'),
          subtitle: t('dashboard.modules.teacherInfo.title', language),
          icon: GraduationCap,
          href: '/teacher-info',
          description: t('dashboard.modules.teacherInfo.description', language)
        },
        {
          title: t('dashboard.modules.teacherLeaves.title', 'kurdish'),
          subtitle: t('dashboard.modules.teacherLeaves.title', language),
          icon: UserX,
          href: '/employee-leaves',
          description: t('dashboard.modules.teacherLeaves.description', language)
        },
        {
          title: t('dashboard.modules.officerLeaves.title', 'kurdish'),
          subtitle: t('dashboard.modules.officerLeaves.title', language),
          icon: UserX,
          href: '/officer-leaves',
          description: t('dashboard.modules.officerLeaves.description', language)
        }
      ]
    },
    {
      title: '🎓 ' + t('dashboard.sections.studentManagement.title', language),
      titleKurdish: t('dashboard.sections.studentManagement.title', 'kurdish'),
      modules: [
        {
          title: t('dashboard.modules.studentPermissions.title', 'kurdish'),
          subtitle: t('dashboard.modules.studentPermissions.title', language),
          icon: FileCheck,
          href: '/student-permissions',
          description: t('dashboard.modules.studentPermissions.description', language)
        },
        {
          title: t('dashboard.modules.supervisedStudents.title', 'kurdish'),
          subtitle: t('dashboard.modules.supervisedStudents.title', language),
          icon: Users,
          href: '/supervised-students',
          description: t('dashboard.modules.supervisedStudents.description', language)
        }
      ]
    },
    {
      title: '💰 ' + t('dashboard.sections.financeExpenses.title', language),
      titleKurdish: t('dashboard.sections.financeExpenses.title', 'kurdish'),
      modules: [
        {
          title: t('dashboard.modules.payrollManagement.title', 'kurdish'),
          subtitle: t('dashboard.modules.payrollManagement.title', language),
          icon: DollarSign,
          href: '/payroll',
          description: t('dashboard.modules.payrollManagement.description', language)
        },
        {
          title: t('dashboard.modules.annualInstallments.title', 'kurdish'),
          subtitle: t('dashboard.modules.annualInstallments.title', language),
          icon: CreditCard,
          href: '/installments',
          description: t('dashboard.modules.annualInstallments.description', language)
        },
        {
          title: t('dashboard.modules.monthlyExpenses.title', 'kurdish'),
          subtitle: t('dashboard.modules.monthlyExpenses.title', language),
          icon: Receipt,
          href: '/expenses',
          description: t('dashboard.modules.monthlyExpenses.description', language)
        },
        {
          title: t('dashboard.modules.buildingExpenses.title', 'kurdish'),
          subtitle: t('dashboard.modules.buildingExpenses.title', language),
          icon: Building2,
          href: '/building-expenses',
          description: t('dashboard.modules.buildingExpenses.description', language)
        },
        {
          title: t('dashboard.modules.dailyAccounts.title', 'kurdish'),
          subtitle: t('dashboard.modules.dailyAccounts.title', language),
          icon: FileText,
          href: '/daily-accounts',
          description: t('dashboard.modules.dailyAccounts.description', language)
        },
        {
          title: t('dashboard.modules.kitchenExpenses.title', 'kurdish'),
          subtitle: t('dashboard.modules.kitchenExpenses.title', language),
          icon: ChefHat,
          href: '/kitchen-expenses',
          description: t('dashboard.modules.kitchenExpenses.description', language)
        }
      ]
    },
    {
      title: '🔍 ' + t('dashboard.sections.utility.title', language),
      titleKurdish: t('dashboard.sections.utility.title', 'kurdish'),
      modules: [
        {
          title: t('dashboard.modules.generalSearch.title', 'kurdish'),
          subtitle: t('dashboard.modules.generalSearch.title', language),
          icon: Search,
          href: '/general-search',
          description: t('dashboard.modules.generalSearch.description', language)
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto p-2 sm:p-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ProfileManager>
                <div className="relative cursor-pointer group">
                  {profile?.avatar ? (
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40">
                      <AvatarImage 
                        src={profile.avatar} 
                        alt={profile.displayName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                        {profile.displayName?.charAt(0) || 'B'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                      <User className="h-4 w-4 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}
                </div>
              </ProfileManager>
              <div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300 font-medium">
                  {language === 'english' ? 'Welcome To Berdoz' : 'بەخێربێتەوە بۆ بیردۆز'}
                </p>
              </div>
            </div>
            
            {/* Center Navigation - Hidden on mobile, shown on larger screens */}
            <div className="hidden md:flex flex-1 justify-center mx-4 lg:mx-8">
              <MainNavigation />
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-600 transition-all duration-200 hover:shadow-lg hover:scale-105 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">{t('dashboard.logout', language)} / {t('dashboard.logout', 'kurdish')}</span>
                <span className="sm:hidden">{t('dashboard.logout', language)}</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation - Only shown on mobile */}
          <div className="md:hidden mb-4">
            <MainNavigation />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent transition-all duration-300">
              {t('dashboard.title', language)}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('dashboard.subtitle', language)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-1 sm:p-2 lg:p-4 max-w-7xl pb-8 sm:pb-16 overflow-x-visible">
        {/* Modern Dashboard Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-1 sm:px-2 lg:px-4 pb-12 sm:pb-20 overflow-visible">
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
                <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/80 dark:from-gray-800 dark:via-blue-900/30 dark:to-indigo-900/50 rounded-2xl sm:rounded-3xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-blue-300 dark:group-hover:border-blue-500 backdrop-blur-sm">
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Section */}
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="relative">
                          <div className="text-2xl sm:text-3xl lg:text-4xl transform group-hover:scale-110 transition-transform duration-300" role="img" aria-label="section-icon">
                            {section.title.split(' ')[0]}
                          </div>
                          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                        </div>
                        
                        {/* Module Count Badge */}
                        <div className="px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700">
                          {section.modules.length} {t('dashboard.modules', language)}
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
                    <div className="space-y-1 sm:space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 dark:from-gray-200 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 origin-left">
                        {section.title.substring(section.title.indexOf(' ') + 1)}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                        {section.titleKurdish}
                      </p>
                    </div>
                    
                      {/* Quick Stats */}
                    <div className="mt-4 sm:mt-6 flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1 sm:space-x-2">
                        <span className="hidden sm:inline">{t('dashboard.clickToExplore', language)}</span>
                        <span className="sm:hidden">استكشاف</span>
                        {expandedSections[sectionIndex] && (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 animate-pulse">
                            ✓ {t('dashboard.expanded', language)}
                          </span>
                        )}
                      </span>
                      <div className="flex space-x-0.5 sm:space-x-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-300 ${
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
            {t('dashboard.footer', language)}
          </p>
        </div>
      </div>
    </div>
  )
}