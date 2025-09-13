'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Lock, User } from 'lucide-react'

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    console.log('Login attempt:', { username: username.trim(), password: password ? '[PROVIDED]' : '[EMPTY]' })

    try {
      // Enhanced authentication check with better validation
      if (username.trim() === 'berdoz' && password === 'berdoz@code') {
        console.log('Credentials valid, proceeding with login')
        
        // Store login state - client-side only
        if (typeof window !== 'undefined' && window.localStorage) {
          const authData = {
            username: 'berdoz',
            loginTime: new Date().toISOString(),
            isAuthenticated: true
          }
          localStorage.setItem('berdoz_auth', JSON.stringify(authData))
          console.log('Auth data saved to localStorage')
        }
        
        // Call the login callback
        console.log('Calling onLogin with true')
        onLogin(true)
      } else {
        console.log('Invalid credentials')
        // Enhanced error handling with specific messages
        if (!username.trim()) {
          setError('Username is required. Please enter your username.')
        } else if (!password) {
          setError('Password is required. Please enter your password.')
        } else {
          setError('Invalid username or password. Please check your credentials and try again.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred during login. Please try again.')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 transition-all duration-500">
      <Card className="w-full max-w-md shadow-2xl dark:bg-gray-900/80 dark:border-gray-700 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-600">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <Lock className="h-8 w-8 text-white group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-400 dark:via-purple-400 dark:to-blue-300 bg-clip-text text-transparent">
            Berdoz Management System
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-300">
            سیستەمی بەڕێوبردنی بیردۆز
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Username / ناوی بەکارهێنەر
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700 border-2 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 group-hover:shadow-md"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Password / نهێنی وشە
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:border-gray-700 border-2 hover:border-blue-300 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 group-hover:shadow-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/30 dark:border-red-700">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <span className="group-hover:scale-105 transition-transform duration-200">
                  Sign In / چوونەژوورەوە
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Berdoz Management System v1.0
              </p>
              <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
                سیستەمی بەڕێوەبردنی بیردۆز
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginPage