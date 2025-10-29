'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ProfileContext = createContext({
  profile: null,
  loading: false,
  updateProfile: () => {},
  refreshProfile: () => {}
})

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
}

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async () => {
    try {
      setLoading(true)
      console.log('Loading profile...')
      const response = await fetch('/api/profile')
      console.log('Profile API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data loaded:', data)
        setProfile(data)
      } else {
        console.log('Profile API failed, using default profile')
        // Set default profile if API fails
        const defaultProfile = {
          username: 'berdoz',
          displayName: 'Berdoz Administrator',
          email: 'admin@berdoz.edu.krd',
          bio: 'System Administrator for Berdoz Educational Institution Management System',
          phone: '+964 750 123 4567',
          location: 'Erbil, Kurdistan Region, Iraq',
          institution: 'Berdoz Educational Institution',
          role: 'System Administrator',
          joinDate: '2024-01-01',
          avatar: '',
          language: 'kurdish',
          theme: 'system',
          emailNotifications: true,
          systemAlerts: true,
          backupReminders: true
        }
        setProfile(defaultProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      // Set default profile on error
      const defaultProfile = {
        username: 'berdoz',
        displayName: 'Berdoz Administrator',
        email: 'admin@berdoz.edu.krd',
        bio: 'System Administrator for Berdoz Educational Institution Management System',
        phone: '+964 750 123 4567',
        location: 'Erbil, Kurdistan Region, Iraq',
        institution: 'Berdoz Educational Institution',
        role: 'System Administrator',
        joinDate: '2024-01-01',
        avatar: '',
        language: 'kurdish',
        theme: 'system',
        emailNotifications: true,
        systemAlerts: true,
        backupReminders: true
      }
      setProfile(defaultProfile)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const updateProfile = async (updatedData) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      })

      if (response.ok) {
        setProfile(prev => ({ ...prev, ...updatedData }))
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const refreshProfile = () => {
    loadProfile()
  }

  const value = {
    profile,
    loading,
    updateProfile,
    refreshProfile
  }

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}