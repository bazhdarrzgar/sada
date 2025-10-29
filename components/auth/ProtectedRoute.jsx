'use client'

import { useAuth } from './AuthContext'
import LoginPage from './LoginPage'
import { useEffect, useState } from 'react'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, login, mounted } = useAuth()
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Only show content after both auth and component are ready
    if (mounted && !isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [mounted, isLoading])

  // Always show loading during hydration
  if (!mounted || isLoading || !showContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Berdoz Management System...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />
  }

  return <>{children}</>
}

export default ProtectedRoute