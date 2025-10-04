'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    // Clear all authentication related data
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('username')
    localStorage.removeItem('berdoz_auth')
    // Clear all section authentications
    localStorage.removeItem('kitchen_expenses_auth')
    localStorage.removeItem('payroll_auth')
    localStorage.removeItem('installments_auth')
    localStorage.removeItem('expenses_auth')
    localStorage.removeItem('building_expenses_auth')
    localStorage.removeItem('daily_accounts_auth')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}