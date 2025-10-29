'use client'

import { useState } from 'react'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, User, Lock, GraduationCap } from 'lucide-react'

export default function LoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // FIXED: Proper authentication validation
      // Only accept the correct credentials for security
      if (credentials.username.trim() === 'berdoz' && credentials.password === 'berdoz@code') {
        login({
          username: credentials.username.trim(),
          role: 'admin',
          id: 1
        })
      } else {
        // Enhanced error messages for better user experience
        if (!credentials.username.trim()) {
          throw new Error('Username is required. Please enter your username.')
        } else if (!credentials.password) {
          throw new Error('Password is required. Please enter your password.')
        } else {
          throw new Error('Invalid username or password. Please check your credentials and try again.')
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-3 sm:px-4 py-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2 px-4 sm:px-6 pt-6 sm:pt-8">
            <div className="mx-auto bg-blue-600 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-1 leading-tight">
              Berdoz Management System
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed px-2">
              سیستەمی بەڕێوەبردنی بیردۆز
            </p>
          </CardHeader>

          <CardContent className="pt-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Username / ناوی بەکارهێنەر"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="pl-10 h-11 sm:h-12 text-base sm:text-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password / نهێنی وشە"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="pl-10 pr-10 h-11 sm:h-12 text-base sm:text-lg border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 sm:h-12 text-base sm:text-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In / چوونەژوورەوە'
                )}
              </Button>
              
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Berdoz Management System
                <br />
                سیستەمی بەڕێوبردنی بیردۆز
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}