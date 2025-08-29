'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

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

  useEffect(() => {
    // Simpler auth check - client-side only
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        try {
          const authData = localStorage.getItem('berdoz_auth')
          if (authData) {
            const parsed = JSON.parse(authData)
            if (parsed.isAuthenticated && parsed.username === 'berdoz') {
              setIsAuthenticated(true)
              setUser({ username: parsed.username, loginTime: parsed.loginTime })
            }
          }
        } catch (error) {
          console.error('Auth check error:', error)
          localStorage.removeItem('berdoz_auth')
        }
      }
      setIsLoading(false)
    }

    // Immediate check
    checkAuth()
  }, [])

  const login = (success) => {
    if (success) {
      const authData = {
        username: 'berdoz',
        loginTime: new Date().toISOString(),
        isAuthenticated: true
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('berdoz_auth', JSON.stringify(authData))
      }
      
      setIsAuthenticated(true)
      setUser({ username: authData.username, loginTime: authData.loginTime })
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('berdoz_auth')
    }
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}