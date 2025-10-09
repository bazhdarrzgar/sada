'use client'

import Navigation from './Navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LanguageToggle } from '@/components/ui/language-toggle'
import { LocalLanguageToggle } from '@/components/ui/local-language-toggle'
import { ZoomControls } from '@/components/ui/zoom-controls'

export default function PageLayout({ children, title, titleKu, showBackButton = true, localLanguage, onLanguageChange }) {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Navigation />
      
      <div className="flex-1 w-full px-28 py-6 overflow-y-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Link href="/">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back / گەڕانەوە</span>
                  </Button>
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-right">
                  {titleKu}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {title}
                </p>
              </div>
            </div>
            
            {/* Theme and Language Controls */}
            <div className="flex items-center gap-2">
              <ZoomControls variant="ghost" className="mr-2" />
              {onLanguageChange ? (
                <LocalLanguageToggle 
                  onLanguageChange={onLanguageChange}
                  initialLanguage={localLanguage || 'kurdish'}
                />
              ) : (
                <LanguageToggle />
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  )
}