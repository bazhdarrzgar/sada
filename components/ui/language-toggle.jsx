'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Languages, Globe } from 'lucide-react'

// Create Language Context
const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('kurdish') // Default to Kurdish
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load language preference from localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const savedLanguage = localStorage.getItem('language')
        if (savedLanguage) {
          setLanguage(savedLanguage)
        }
      } catch (error) {
        console.error('Error loading language preference:', error)
      }
    }
  }, [])

  const toggleLanguage = () => {
    const newLanguage = language === 'kurdish' ? 'english' : 'kurdish'
    setLanguage(newLanguage)
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('language', newLanguage)
      } catch (error) {
        console.error('Error saving language preference:', error)
      }
    }
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, mounted }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export function LanguageToggle() {
  const { language, toggleLanguage, mounted } = useLanguage()

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full border-2 border-transparent"
        disabled
      >
        <Globe className="h-5 w-5" />
      </Button>
    )
  }

  const getIcon = () => {
    return language === 'kurdish' ? (
      <Languages className="h-5 w-5 text-green-600 group-hover:text-green-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
    ) : (
      <Globe className="h-5 w-5 text-blue-600 group-hover:text-blue-500 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
    )
  }

  const getTooltipText = () => {
    return language === 'kurdish' ? 'Switch to English' : 'گۆڕین بۆ کوردی'
  }

  const getButtonText = () => {
    return language === 'kurdish' ? 'EN' : 'کوردی'
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="relative h-10 px-3 rounded-full border-2 border-transparent hover:border-green-200 dark:hover:border-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 dark:hover:from-green-900/30 dark:hover:to-blue-900/30 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95 group flex items-center gap-2"
      aria-label={getTooltipText()}
    >
      <div className="relative overflow-hidden flex items-center gap-2">
        {getIcon()}
        <span className="text-sm font-medium group-hover:scale-105 transition-transform duration-200">
          {getButtonText()}
        </span>
        
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
      </div>
      
      {/* Enhanced tooltip */}
      <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
        <div className="bg-black/90 dark:bg-white/90 text-white dark:text-black text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            {language === 'english' ? <Languages className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
            {getTooltipText()}
          </div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 dark:bg-white/90 rotate-45"></div>
        </div>
      </div>

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-full opacity-0 group-active:opacity-30 bg-green-500 animate-ping group-active:animate-none transition-opacity duration-150"></div>
    </Button>
  )
}