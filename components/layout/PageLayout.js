'use client'

import Navigation from './Navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PageLayout({ children, title, titleKu, showBackButton = true }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
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