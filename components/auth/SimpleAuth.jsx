'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, User } from 'lucide-react'
import { AuthProvider } from './AuthContext'

export default function SimpleAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      try {
        console.log('SimpleAuth: Checking authentication...')
        if (typeof window !== 'undefined') {
          const authToken = localStorage.getItem('auth_token')
          const authTime = localStorage.getItem('auth_time')
          const currentTime = Date.now()
          
          console.log('SimpleAuth: Auth token found:', authToken)
          
          // Check if token exists and is not expired (24 hours)
          if (authToken === 'authenticated_berdoz' && authTime) {
            const sessionAge = currentTime - parseInt(authTime)
            const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
            
            if (sessionAge < maxSessionAge) {
              console.log('SimpleAuth: User is authenticated and session is valid')
              setIsAuthenticated(true)
            } else {
              console.log('SimpleAuth: Session expired, logging out')
              handleLogout()
              setIsAuthenticated(false)
            }
          } else {
            console.log('SimpleAuth: User is not authenticated')
            setIsAuthenticated(false)
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      }
      console.log('SimpleAuth: Setting loading to false')
      setIsLoading(false)
    }

    // Call checkAuth immediately
    checkAuth()
  }, [])

  // Listen for logout events from AuthContext
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('SimpleAuth: Storage change detected')
      const authToken = localStorage.getItem('auth_token')
      const authTime = localStorage.getItem('auth_time')
      const currentTime = Date.now()
      
      console.log('SimpleAuth: Auth token on storage change:', authToken)
      
      if (authToken === 'authenticated_berdoz' && authTime) {
        const sessionAge = currentTime - parseInt(authTime)
        const maxSessionAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        
        if (sessionAge < maxSessionAge) {
          console.log('SimpleAuth: Setting authenticated to true')
          setIsAuthenticated(true)
        } else {
          console.log('SimpleAuth: Session expired during storage check')
          handleLogout()
          setIsAuthenticated(false)
        }
      } else {
        console.log('SimpleAuth: Setting authenticated to false')
        setIsAuthenticated(false)
      }
    }

    // Listen for storage events (works across tabs/windows)
    window.addEventListener('storage', handleStorageChange)
    
    // Also check more frequently for in-tab changes
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      // Simple validation
      if (username.trim() === 'berdoz' && password === 'berdoz@code') {
        // Save auth state with timestamp
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', 'authenticated_berdoz')
          localStorage.setItem('auth_time', Date.now().toString())
          localStorage.setItem('username', 'berdoz')
        }
        
        // Update state and sync with AuthContext
        setIsAuthenticated(true)
        
        // Also set a fake user for the AuthContext
        if (typeof window !== 'undefined') {
          const userData = { username: 'berdoz', name: 'Berdoz Management' }
          localStorage.setItem('user', JSON.stringify(userData))
        }
        
        // Show success feedback
        console.log('Login successful')
      } else {
        setError('Invalid username or password')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_time')
      localStorage.removeItem('username')
      localStorage.removeItem('user') // Also remove user for AuthContext
      localStorage.removeItem('berdoz_auth')
    }
    setIsAuthenticated(false)
  }

  // Show loading screen during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Berdoz Management System...</p>
        </div>
      </div>
    )
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-lg">
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Berdoz Management System
            </CardTitle>
            <p className="text-gray-600 font-medium">
              سیستەمی بەڕێوبردنی بیردۆز
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username / ناوی بەکارهێنەر
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username (berdoz)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password / نهێنی وشە
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In / چوونەژوورەوە'
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Berdoz Management System v1.0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Return the authenticated app with AuthProvider
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}