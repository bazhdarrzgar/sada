'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useLanguage } from '@/components/ui/language-toggle'
import { t } from '@/lib/translations'
import { 
  Calendar, Users, DollarSign, Shield, CreditCard, Receipt, FileText, Building2, ChefHat, GraduationCap, UserX, FileCheck, Activity, ClipboardCheck, Search, Bus 
} from 'lucide-react'

export default function MainNavigation() {
  const { language } = useLanguage()
  const [hoveredSection, setHoveredSection] = useState(null)

  const navigationSections = [
    {
      title: t('dashboard.sections.administration.title', language),
      modules: [
        {
          title: t('dashboard.modules.calendarManagement.title', 'kurdish'),
          icon: Calendar,
          href: '/calendar'
        },
        {
          title: t('dashboard.modules.activities.title', 'kurdish'),
          icon: Activity,
          href: '/activities'
        },
        {
          title: t('dashboard.modules.examSupervision.title', 'kurdish'),
          icon: ClipboardCheck,
          href: '/exam-supervision'
        },
        {
          title: t('dashboard.modules.supervision.title', 'kurdish'),
          icon: Shield,
          href: '/supervision'
        },
        {
          title: t('dashboard.modules.busManagement.title', 'kurdish'),
          icon: Bus,
          href: '/bus'
        }
      ]
    },
    {
      title: t('dashboard.sections.teacherManagement.title', language),
      modules: [
        {
          title: t('dashboard.modules.staffRecords.title', 'kurdish'),
          icon: Users,
          href: '/staff'
        },
        {
          title: t('dashboard.modules.teachersRecords.title', 'kurdish'),
          icon: GraduationCap,
          href: '/teachers'
        },
        {
          title: t('dashboard.modules.teacherInfo.title', 'kurdish'),
          icon: GraduationCap,
          href: '/teacher-info'
        },
        {
          title: t('dashboard.modules.teacherLeaves.title', 'kurdish'),
          icon: UserX,
          href: '/employee-leaves'
        },
        {
          title: t('dashboard.modules.officerLeaves.title', 'kurdish'),
          icon: UserX,
          href: '/officer-leaves'
        }
      ]
    },
    {
      title: t('dashboard.sections.studentManagement.title', language),
      modules: [
        {
          title: t('dashboard.modules.studentPermissions.title', 'kurdish'),
          icon: FileCheck,
          href: '/student-permissions'
        },
        {
          title: t('dashboard.modules.supervisedStudents.title', 'kurdish'),
          icon: Users,
          href: '/supervised-students'
        }
      ]
    },
    {
      title: t('dashboard.sections.financeExpenses.title', language),
      modules: [
        {
          title: t('dashboard.modules.payrollManagement.title', 'kurdish'),
          icon: DollarSign,
          href: '/payroll'
        },
        {
          title: t('dashboard.modules.annualInstallments.title', 'kurdish'),
          icon: CreditCard,
          href: '/installments'
        },
        {
          title: t('dashboard.modules.monthlyExpenses.title', 'kurdish'),
          icon: Receipt,
          href: '/expenses'
        },
        {
          title: t('dashboard.modules.buildingExpenses.title', 'kurdish'),
          icon: Building2,
          href: '/building-expenses'
        },
        {
          title: t('dashboard.modules.dailyAccounts.title', 'kurdish'),
          icon: FileText,
          href: '/daily-accounts'
        },
        {
          title: t('dashboard.modules.kitchenExpenses.title', 'kurdish'),
          icon: ChefHat,
          href: '/kitchen-expenses'
        }
      ]
    },
    {
      title: t('dashboard.sections.utility.title', language),
      modules: [
        {
          title: t('dashboard.modules.generalSearch.title', 'kurdish'),
          icon: Search,
          href: '/general-search'
        }
      ]
    }
  ]

  return (
    <div className="flex items-center justify-center w-full">
      <nav className="flex items-center justify-center space-x-1 sm:space-x-2 md:space-x-3 lg:space-x-4 xl:space-x-6" role="navigation" aria-label="Main navigation">
        {navigationSections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="relative flex-shrink-0"
            onMouseEnter={() => setHoveredSection(sectionIndex)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div className="px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 text-xs sm:text-sm font-medium whitespace-nowrap text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all duration-200 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-2xl backdrop-saturate-200 border border-gray-200/20 dark:border-gray-700/20 shadow-lg hover:shadow-2xl hover:bg-white/40 dark:hover:bg-gray-800/40 hover:backdrop-blur-3xl hover:backdrop-saturate-300 hover:scale-105 transform relative">
              {/* Enhanced blur overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-blue-50/30 to-white/20 dark:from-gray-800/20 dark:via-blue-900/30 dark:to-gray-800/20 rounded-lg backdrop-blur-xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <span className="hidden lg:inline">{section.title}</span>
                <span className="hidden sm:inline lg:hidden">
                  {section.title.length > 15 ? section.title.substring(0, 12) + '...' : section.title}
                </span>
                <span className="sm:hidden">
                  {section.title.split(' ')[0]}
                </span>
              </div>
            </div>
            
            {hoveredSection === sectionIndex && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white/20 dark:bg-gray-800/20 backdrop-blur-3xl backdrop-saturate-200 border border-gray-200/30 dark:border-gray-700/30 rounded-xl shadow-2xl z-50 min-w-64 max-w-xs">
                {/* Primary blur layer */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-blue-50/40 to-indigo-100/50 dark:from-gray-800/30 dark:via-blue-900/40 dark:to-indigo-900/50 rounded-xl backdrop-blur-2xl"></div>
                
                {/* Secondary blur enhancement layer */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/10 dark:from-gray-800/10 dark:to-gray-800/10 rounded-xl backdrop-blur-xl"></div>
                
                {/* Tertiary glass effect layer */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent dark:via-gray-800/15 rounded-xl backdrop-blur-lg"></div>
                
                {/* Content with relative positioning */}
                <div className="relative z-20 backdrop-blur-sm">
                  {section.modules.map((module, moduleIndex) => {
                    const IconComponent = module.icon
                    return (
                      <Link
                        key={moduleIndex}
                        href={module.href}
                        className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-white/20 dark:hover:bg-gray-700/20 hover:backdrop-blur-2xl first:rounded-t-xl last:rounded-b-xl transition-all duration-200 hover:shadow-lg relative group"
                      >
                        <IconComponent className="h-4 w-4 relative z-10" />
                        <span className="relative z-10 truncate" style={{ fontFamily: 'Tahoma, Arial, sans-serif' }}>
                          {module.title}
                        </span>
                        {/* Individual item blur effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-blue-50/15 to-white/5 dark:from-gray-800/5 dark:via-blue-900/15 dark:to-gray-800/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-xl"></div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}