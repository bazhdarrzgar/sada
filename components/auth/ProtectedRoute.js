'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import LoginForm from './LoginForm'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-200 rounded-full mb-4 mx-auto"></div>
          <div className="w-32 h-4 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return children
}