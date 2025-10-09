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
import { ZoomControls } from '@/components/ui/zoom-controls'

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

  const toggleSection = (sectionIndex, event) => {
    // Prevent default behavior to avoid page jumping
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Fixed Header - Full Width - Mobile First */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-8 py-2 sm:px-10 sm:py-3 md:px-12 lg:px-20 xl:px-24">
          {/* Top Row - Avatar, Welcome, Actions */}
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2 sm:mb-3">
            {/* Left Section - Avatar & Welcome */}
            <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
              <ProfileManager>
                <button 
                  className="relative cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                  aria-label="Profile"
                >
                  {profile?.avatar ? (
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40">
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
                    <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                      <User className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  )}
                </button>
              </ProfileManager>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 transition-colors duration-300 font-medium truncate">
                  {language === 'english' ? 'Welcome To Berdoz' : 'بەخێربێتەوە بۆ بیردۆز'}
                </p>
              </div>
            </div>
            
            {/* Center Navigation - Hidden on mobile, shown on larger screens */}
            <nav className="hidden lg:flex flex-1 justify-center mx-4 xl:mx-8" aria-label="Main navigation">
              <MainNavigation />
            </nav>
            
            {/* Right Section - Controls & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <ZoomControls variant="ghost" className="hidden sm:flex" />
              <LanguageToggle />
              <ThemeToggle />
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center space-x-1.5 sm:space-x-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-600 transition-all duration-200 hover:shadow-lg hover:scale-105 group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-xs sm:text-sm px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 min-h-[44px] touch-manipulation"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 group-hover:scale-110 transition-transform duration-200" />
                <span className="hidden sm:inline">{t('dashboard.logout', language)} / {t('dashboard.logout', 'kurdish')}</span>
                <span className="sm:hidden">{t('dashboard.logout', language)}</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile & Tablet Navigation - Only shown below lg breakpoint */}
          <nav className="lg:hidden mb-2 sm:mb-3" aria-label="Mobile navigation">
            <MainNavigation />
          </nav>
          
          {/* Title Section - Responsive Typography with Enhanced Spacing */}
          <div className="text-center space-y-1 sm:space-y-2 pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent transition-all duration-300 leading-tight">
              {t('dashboard.title', language)}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 transition-colors duration-300 px-4">{t('dashboard.subtitle', language)}</p>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile First with Dynamic Padding */}
      <main className="flex-1 pt-48 mt-0 pb-8 sm:pb-16 px-1 sm:px-2 lg:px-4 max-w-7xl mx-auto overflow-y-auto overflow-x-visible">
        {/* Modern Dashboard Grid Layout - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 pb-6 sm:pb-8 md:pb-10">
          {modulesSections.map((section, sectionIndex) => (
            <article key={sectionIndex} className="group w-full">
              {/* Modern Section Card - Mobile First */}
              <button 
                className={`relative overflow-hidden w-full text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] md:hover:scale-105 transform-gpu touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  clickAnimation[sectionIndex] ? 'scale-95' : ''
                }`}
                onClick={(e) => toggleSection(sectionIndex, e)}
                aria-expanded={expandedSections[sectionIndex]}
                aria-label={`${section.title.substring(section.title.indexOf(' ') + 1)} section`}
              >
                {/* Main Section Card */}
                <div className="relative p-3 sm:p-4 md:p-5 bg-gradient-to-br from-white via-blue-50/50 to-indigo-100/80 dark:from-gray-800 dark:via-blue-900/30 dark:to-indigo-900/50 rounded-lg sm:rounded-xl md:rounded-2xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-blue-300 dark:group-hover:border-blue-500 backdrop-blur-sm min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 dark:from-blue-400/10 dark:to-purple-400/10 rounded-lg sm:rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Section - Mobile First */}
                    <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
                      <div className="flex items-center space-x-2 sm:space-x-2.5 md:space-x-3 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="text-2xl sm:text-2xl md:text-3xl transform group-hover:scale-110 transition-transform duration-300" role="img" aria-label="section-icon">
                            {section.title.split(' ')[0]}
                          </div>
                          <div className="absolute -inset-1 sm:-inset-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                        </div>
                        
                        {/* Module Count Badge */}
                        <div className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-700 flex-shrink-0">
                          {section.modules.length} {t('dashboard.modules', language)}
                        </div>
                      </div>
                      
                      {/* Expand/Collapse Icon - Touch Friendly */}
                      <div className="p-1.5 sm:p-2 bg-white/60 dark:bg-gray-700/60 rounded-full shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110 backdrop-blur-sm flex-shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center">
                        {expandedSections[sectionIndex] ? 
                          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300 transition-transform duration-300" /> : 
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300 transition-transform duration-300" />
                        }
                      </div>
                    </div>
                    
                    {/* Title Section - Responsive Typography */}
                    <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-3 md:mb-4">
                      <h2 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 dark:from-gray-200 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent group-hover:scale-[1.02] transition-transform duration-300 origin-left leading-tight">
                        {section.title.substring(section.title.indexOf(' ') + 1)}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300 leading-relaxed" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                        {section.titleKurdish}
                      </p>
                    </div>
                    
                    {/* Quick Stats - Mobile Optimized */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 gap-2">
                      <span className="flex items-center space-x-1.5 sm:space-x-2 flex-1 min-w-0">
                        <span className="hidden sm:inline truncate">{t('dashboard.clickToExplore', language)}</span>
                        <span className="sm:hidden">استكشاف</span>
                        {expandedSections[sectionIndex] && (
                          <span className="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 animate-pulse flex-shrink-0">
                            ✓ {t('dashboard.expanded', language)}
                          </span>
                        )}
                      </span>
                      <div className="flex space-x-1 flex-shrink-0">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 dark:bg-blue-500 rounded-full transition-all duration-300 ${
                            expandedSections[sectionIndex] 
                              ? 'opacity-100 animate-bounce' 
                              : 'opacity-50 group-hover:opacity-100'
                          }`} style={{animationDelay: `${i * 0.1}s`}}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Animated Border - Hidden on Mobile to Improve Performance */}
                  <div className="hidden sm:block absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 p-0.5">
                      <div className="w-full h-full rounded-3xl bg-white dark:bg-gray-800"></div>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Expandable Modules Section - Mobile First */}
              <div className={`transition-all duration-300 ease-out ${
                expandedSections[sectionIndex] 
                  ? 'max-h-[5000px] opacity-100 transform translate-y-0 mt-3 sm:mt-4 md:mt-5' 
                  : 'max-h-0 opacity-0 transform -translate-y-4 overflow-hidden'
              }`}>
                <nav className="space-y-2 sm:space-y-3" aria-label={`${section.title} modules`}>
                  {section.modules.map((module, moduleIndex) => {
                    const IconComponent = module.icon
                    return (
                      <Link key={module.href} href={module.href} className="block">
                        <article 
                          className={`group/module relative p-3 sm:p-4 ${moduleIndex === 0 ? 'mt-2 sm:mt-3' : ''} bg-transparent hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 rounded-lg sm:rounded-xl border border-gray-200/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02] transform-gpu hover:border-blue-300/70 dark:hover:border-blue-500/70 touch-manipulation focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 min-h-[60px] sm:min-h-[70px]`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            {/* Icon - Touch Friendly Size */}
                            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-lg group-hover/module:scale-110 group-hover/module:rotate-3 transition-all duration-200 shadow-md group-hover/module:shadow-lg flex-shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center">
                              <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 group-hover/module:text-blue-700 dark:group-hover/module:text-blue-300" />
                            </div>
                            
                            {/* Text Content - Flexible Layout */}
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 group-hover/module:text-blue-700 dark:group-hover/module:text-blue-300 transition-colors duration-200 line-clamp-1" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                                {module.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover/module:text-gray-700 dark:group-hover/module:text-gray-300 transition-colors duration-200 line-clamp-1">
                                {module.subtitle}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 group-hover/module:text-gray-600 dark:group-hover/module:text-gray-400 transition-colors duration-200 line-clamp-2 hidden sm:block">
                                {module.description}
                              </p>
                            </div>
                            
                            {/* Arrow Icon - Touch Friendly */}
                            <div className="flex-shrink-0">
                              <div className="p-1.5 sm:p-2 bg-blue-100/70 dark:bg-blue-900/40 rounded-full group-hover/module:bg-blue-200 dark:group-hover/module:bg-blue-800/60 transition-all duration-200 min-w-[32px] min-h-[32px] flex items-center justify-center">
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400 group-hover/module:text-blue-700 dark:group-hover/module:text-blue-300 group-hover/module:translate-x-1 transition-all duration-200" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover Effect Border - Hidden on Mobile */}
                          <div className="hidden sm:block absolute inset-0 rounded-lg opacity-0 group-hover/module:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 blur-sm"></div>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </article>
          ))}
        </div>

        {/* Footer - Mobile First */}
        <footer className="mt-6 sm:mt-8 md:mt-10 pb-6 sm:pb-8 text-center">
          <p className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300 px-4">
            <span>{t('dashboard.footer', language)}</span>
          </p>
        </footer>
      </main>
    </div>
  )
}
