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
    if (confirm('Are you sure you want to logout? / دڵنیایت لە دەرچوون؟')) {
      logout()
    }
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
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-full">
                <Home className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 dark:text-white">Berdoz Management</h2>
                <p className="text-xs text-gray-500">Educational Institution System</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="hidden xl:inline">{item.labelKu}</span>
                <span className="xl:hidden">{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-2 mr-4">
              <div className="p-1 bg-blue-100 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.username}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:ml-2 sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.slice(0, 4).map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  pathname === item.href 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.labelKu}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {navItems.slice(4).map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  pathname === item.href 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {item.labelKu}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}