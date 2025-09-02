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
      // Simple authentication - for demo purposes
      // In a real app, this would be an API call
      if (credentials.username && credentials.password) {
        // Accept any non-empty credentials for demo
        login({
          username: credentials.username,
          role: 'admin',
          id: 1
        })
      } else {
        throw new Error('Please enter both username and password')
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    login({
      username: 'admin',
      role: 'admin',
      id: 1
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              بەردۆز Management System
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Educational Institution Management / سیستەمی بەڕێوەبردنی پەروەردە
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Username / ناوی بەکارهێنەر"
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="pl-10 h-12 text-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password / نهێنوشە"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="pl-10 pr-10 h-12 text-lg"
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

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Signing In...' : 'Sign In / چوونەژوورەوە'}
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">For testing purposes:</p>
                <Button
                  type="button"
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full h-10 text-sm"
                >
                  Demo Login (Any Credentials)
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                Berdoz Educational Institution Management System
                <br />
                سیستەمی بەڕێوەبردنی دامەزراوەی پەروەردەیی بەردۆز
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}