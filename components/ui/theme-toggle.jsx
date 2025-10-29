'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border-2 border-transparent"
        disabled
      >
        <Monitor className="h-5 w-5" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5 text-amber-500 group-hover:text-amber-400 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
      case 'dark':
        return <Moon className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
      default:
        return <Monitor className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 group-hover:scale-110" />
    }
  }

  const getTooltipText = () => {
    switch (theme) {
      case 'light':
        return 'Switch to Dark Mode'
      case 'dark':
        return 'Switch to System'
      default:
        return 'Switch to Light Mode'
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="relative h-10 w-10 rounded-full border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95 group"
      aria-label={getTooltipText()}
    >
      <div className="relative overflow-hidden">
        {getIcon()}
        
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
      </div>
      
      {/* Enhanced tooltip */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
        <div className="bg-black/90 dark:bg-white/90 text-white dark:text-black text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            {theme === 'light' && <Moon className="h-3 w-3" />}
            {theme === 'dark' && <Monitor className="h-3 w-3" />}
            {theme === 'system' && <Sun className="h-3 w-3" />}
            {getTooltipText()}
          </div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 dark:bg-white/90 rotate-45"></div>
        </div>
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-30 bg-blue-500 animate-ping group-active:animate-none transition-opacity duration-150"></div>
    </Button>
  )
}