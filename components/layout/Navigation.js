'use client'

import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, User, Sun, Moon, Home } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { href: '/', label: 'Dashboard', labelKu: 'سەرەکی' },
    { href: '/general-search', label: 'General Search', labelKu: 'گەرانی گشتی' },
    { href: '/calendar', label: 'Calendar', labelKu: 'ساڵنامە' },
    { href: '/staff', label: 'Staff', labelKu: 'ستاف' },
    { href: '/payroll', label: 'Payroll', labelKu: 'موچە' },
    { href: '/activities', label: 'Activities', labelKu: 'چالاکی' },
    { href: '/exam-supervision', label: 'Exam Supervision', labelKu: 'چاودێریکردنی تاقیرکدنەوە' },
    { href: '/student-permissions', label: 'Student Permissions', labelKu: 'مۆڵەت' },
    { href: '/employee-leaves', label: 'Employee Leaves', labelKu: 'مۆڵەتی فەرمانبەران' },
    { href: '/supervision', label: 'Supervision', labelKu: 'چاودێری' }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="w-full px-28">
        <div className="flex justify-between items-center py-3">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-blue-600 rounded-full flex-shrink-0 transition-colors group-hover:bg-blue-700">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h2 className="font-bold text-gray-800 dark:text-white text-base leading-tight truncate">
                  Berdoz Management
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5 truncate">
                  Educational Institution System
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-700 rounded-lg p-1 max-w-full overflow-x-auto">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap min-w-fit ${
                    pathname === item.href 
                      ? 'bg-white dark:bg-gray-600 text-blue-700 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-700 hover:bg-white hover:shadow-sm dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={`${item.label} / ${item.labelKu}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="hidden xl:inline text-xs leading-tight">{item.labelKu}</span>
                    <span className="xl:hidden text-xs leading-tight">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* User Info */}
            <div className="hidden sm:flex items-center space-x-3 mr-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white leading-tight truncate max-w-24">
                  {user?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate">
                  Administrator / بەڕێوەبەر
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 p-0 rounded-full"
                title={theme === 'dark' ? 'Light Mode / دۆخی ڕووناک' : 'Dark Mode / دۆخی تاریک'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900 h-9 px-3"
                title="Logout / دەرچوون"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          {/* Primary Navigation */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1 uppercase tracking-wide">
              Primary / سەرەکی
            </p>
            <div className="grid grid-cols-2 gap-2">
              {navItems.slice(0, 4).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 text-center border ${
                    pathname === item.href 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm border-blue-200 dark:border-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm truncate leading-tight">{item.labelKu}</div>
                  <div className="text-xs opacity-75 truncate mt-0.5 leading-tight">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Secondary Navigation */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1 uppercase tracking-wide">
              Management / بەڕێوەبردن
            </p>
            <div className="grid grid-cols-2 gap-2">
              {navItems.slice(4).map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 text-center border ${
                    pathname === item.href 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 shadow-sm border-blue-200 dark:border-blue-800' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-sm truncate leading-tight">{item.labelKu}</div>
                  <div className="text-xs opacity-75 truncate mt-0.5 leading-tight">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}