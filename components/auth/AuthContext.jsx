'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  mounted: false
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Mark as mounted first
    setMounted(true)
    
    // Check authentication state
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          // Check for SimpleAuth token first
          const authToken = localStorage.getItem('auth_token')
          if (authToken === 'authenticated_berdoz') {
            setIsAuthenticated(true)
            setUser({ 
              username: 'berdoz', 
              name: 'Berdoz Management'
            })
            return
          }
          
          // Fallback to check berdoz_auth format
          const authData = localStorage.getItem('berdoz_auth')
          if (authData) {
            const parsed = JSON.parse(authData)
            if (parsed.isAuthenticated === true && parsed.username === 'berdoz') {
              setIsAuthenticated(true)
              setUser({ 
                username: parsed.username, 
                loginTime: parsed.loginTime 
              })
            }
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Clear invalid auth data
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('berdoz_auth')
          localStorage.removeItem('auth_token')
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Delay auth check slightly to ensure proper hydration
    const timer = setTimeout(checkAuth, 200)
    return () => clearTimeout(timer)
  }, [])

  const login = async (success) => {
    if (!mounted) {
      console.log('Login called before component mounted')
      return
    }

    if (success === true) {
      const authData = {
        username: 'berdoz',
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      }
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('berdoz_auth', JSON.stringify(authData))
        }
        
        setIsAuthenticated(true)
        setUser({ 
          username: authData.username, 
          loginTime: authData.loginTime 
        })
        
        // Force a small re-render to ensure state updates
        setTimeout(() => {
          setIsLoading(false)
        }, 100)
        
      } catch (error) {
        console.error('Failed to save auth data:', error)
      }
    }
  }

  const logout = () => {
    console.log('🚪 AuthContext logout called')
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        console.log('🧹 Clearing localStorage items...')
        // Remove all auth-related data from localStorage
        localStorage.removeItem('berdoz_auth')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('username')
        localStorage.removeItem('user')
        console.log('✅ localStorage items cleared')
      }
    } catch (error) {
      console.error('Failed to remove auth data:', error)
    }
    
    console.log('🔄 Setting authentication state to false')
    setIsAuthenticated(false)
    setUser(null)
    console.log('✅ AuthContext logout completed')
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
    mounted
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}