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
    // Check if user is already logged in
    const checkAuthStatus = () => {
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
        console.error('Error checking auth status:', error)
        localStorage.removeItem('berdoz_auth')
      }
      setIsLoading(false)
    }

    checkAuthStatus()
  }, [])

  const login = (success) => {
    if (success) {
      setIsAuthenticated(true)
      setUser({ username: 'berdoz', loginTime: new Date().toISOString() })
    }
  }

  const logout = () => {
    localStorage.removeItem('berdoz_auth')
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