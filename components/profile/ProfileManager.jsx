'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Settings, 
  Mail, 
  Lock, 
  Shield, 
  Save, 
  Camera, 
  Eye,
  EyeOff,
  School,
  MapPin,
  Phone,
  Calendar,
  Globe,
  Crown,
  Building2,
  Database,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  ImageIcon
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { useProfile } from '@/components/profile/ProfileContext'
import ImageCropper from '@/components/ui/image-cropper'
import EnhancedImage from '@/components/ui/enhanced-image'
import { toast } from 'sonner'

// Utility function to preload and cache images
const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // Handle CORS issues
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Image cache for better performance
const imageCache = new Map()

const ProfileManager = ({ children }) => {
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfile, refreshProfile } = useProfile()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Image cropping state
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImageSrc, setSelectedImageSrc] = useState(null)
  const [localProfile, setLocalProfile] = useState(null)
  
  // Enhanced image preview state
  const [imagePreview, setImagePreview] = useState(null)
  const [imageUploadProgress, setImageUploadProgress] = useState(0)
  const [avatarKey, setAvatarKey] = useState(Date.now()) // Force re-render of avatar
  const [refreshingAvatar, setRefreshingAvatar] = useState(false)

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Backup state
  const [backupLoading, setBackupLoading] = useState(false)
  const [backupProgress, setBackupProgress] = useState('')
  
  // Restore state
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  // Sync profile data from context
  useEffect(() => {
    if (profile) {
      setLocalProfile(profile)
      // Update image preview when profile changes
      if (profile.avatar) {
        setImagePreview(profile.avatar)
        setAvatarKey(Date.now()) // Force avatar refresh
      }
    }
  }, [profile])

  // Enhanced avatar refresh effect
  useEffect(() => {
    if (localProfile?.avatar && localProfile.avatar !== imagePreview) {
      setImagePreview(localProfile.avatar)
      setAvatarKey(Date.now())
    }
  }, [localProfile?.avatar])

  // Manual avatar refresh function
  const refreshAvatar = async () => {
    setRefreshingAvatar(true)
    try {
      // Refresh profile data from server
      await refreshProfile()
      
      // Force avatar refresh
      setAvatarKey(Date.now())
      
      // Clear cache and reload image
      if (localProfile?.avatar) {
        const cacheBustingUrl = `${localProfile.avatar}?t=${Date.now()}`
        setImagePreview(cacheBustingUrl)
        
        // Preload the refreshed image
        try {
          await preloadImage(cacheBustingUrl)
        } catch (error) {
          console.warn('Failed to preload refreshed avatar:', error)
        }
      }
      
      toast.success('Avatar refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh avatar')
      console.error('Error refreshing avatar:', error)
    } finally {
      setRefreshingAvatar(false)
    }
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      const success = await updateProfile(localProfile)
      if (success) {
        toast.success('Profile updated successfully!')
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long!')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData)
      })

      if (response.ok) {
        toast.success('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'Failed to change password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image size should be less than 2MB')
      return
    }

    // Create preview URL for cropping
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImageSrc(e.target.result)
      setShowImageCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedBlob) => {
    setIsLoading(true)
    setShowImageCropper(false)
    setImageUploadProgress(10)
    
    try {
      const formData = new FormData()
      formData.append('avatar', croppedBlob, 'avatar.jpg')

      setImageUploadProgress(30)

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      setImageUploadProgress(70)

      if (response.ok) {
        const data = await response.json()
        
        // Create cache-busting URL
        const cacheBustingUrl = `${data.avatarUrl}?t=${Date.now()}`
        
        setImageUploadProgress(85)
        
        // Preload the new image to ensure it's ready
        try {
          await preloadImage(cacheBustingUrl)
          console.log('New avatar image preloaded successfully')
        } catch (preloadError) {
          console.warn('Failed to preload new avatar:', preloadError)
        }
        
        // Update local profile state with immediate preview
        setLocalProfile(prev => ({ ...prev, avatar: data.avatarUrl }))
        setImagePreview(cacheBustingUrl)
        setAvatarKey(Date.now()) // Force refresh
        
        setImageUploadProgress(95)
        
        // Update profile context
        await updateProfile({ ...localProfile, avatar: data.avatarUrl })
        
        setImageUploadProgress(100)
        toast.success('Avatar updated successfully!')
        
        // Multiple refresh attempts to ensure visibility
        setTimeout(() => setAvatarKey(Date.now()), 100)
        setTimeout(() => setAvatarKey(Date.now()), 500)
        setTimeout(() => setAvatarKey(Date.now()), 1000)
        
      } else {
        throw new Error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar. Please try again.')
    } finally {
      setIsLoading(false)
      setSelectedImageSrc(null)
      setTimeout(() => setImageUploadProgress(0), 1500)
    }
  }

  // Backup functions
  const handleBackupDownload = async () => {
    setBackupLoading(true)
    setBackupProgress('Preparing backup...')
    
    try {
      const response = await fetch('/api/backup', {
        method: 'GET',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create backup')
      }
      
      setBackupProgress('Downloading backup file...')
      
      // Get the blob and create download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition')
      let filename = 'sada_backup.zip'
      if (contentDisposition) {
        const matches = contentDisposition.match(/filename="([^"]*)"/)
        if (matches) filename = matches[1]
      }
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Backup downloaded successfully!')
      setBackupProgress('Backup completed!')
      
    } catch (error) {
      console.error('Backup error:', error)
      toast.error('Failed to create backup: ' + error.message)
      setBackupProgress('')
    } finally {
      setBackupLoading(false)
      setTimeout(() => setBackupProgress(''), 3000)
    }
  }

  // Restore functions
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast.error('Please select a valid backup ZIP file')
        return
      }
      setSelectedFile(file)
      toast.success('Backup file selected: ' + file.name)
    }
  }

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error('Please select a backup file first')
      return
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      '⚠️ WARNING: Restoring from backup will replace ALL current data including:\n\n' +
      '• All database records\n' +
      '• All uploaded images and videos\n' +
      '• All user data and settings\n\n' +
      'This action cannot be undone!\n\n' +
      'Are you sure you want to continue?'
    )

    if (!confirmed) {
      return
    }

    setRestoreLoading(true)
    setRestoreProgress('Uploading backup file...')

    try {
      const formData = new FormData()
      formData.append('backup', selectedFile)

      setRestoreProgress('Processing backup file...')

      const response = await fetch('/api/restore', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to restore backup')
      }

      setRestoreProgress('Restore completed successfully!')
      toast.success('Backup restored successfully! The page will reload in 3 seconds...')
      
      // Clear selected file
      setSelectedFile(null)
      
      // Reload page after 3 seconds to reflect restored data
      setTimeout(() => {
        window.location.reload()
      }, 3000)

    } catch (error) {
      console.error('Restore error:', error)
      toast.error('Failed to restore backup: ' + error.message)
      setRestoreProgress('')
    } finally {
      setRestoreLoading(false)
      setTimeout(() => setRestoreProgress(''), 5000)
    }
  }

  // Restore functionality removed as per user request

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Profile Management
            <span className="text-sm font-normal text-muted-foreground">/ بەڕێوبردنی پرۆفایل</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Backup
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    {/* Avatar with enhanced loading and preview */}
                    <Avatar className="h-24 w-24 ring-2 ring-gray-200 dark:ring-gray-700 transition-all duration-300 group-hover:ring-blue-400 dark:group-hover:ring-blue-500">
                      <AvatarImage 
                        key={avatarKey} // Force re-render
                        src={imagePreview || localProfile?.avatar} 
                        alt={localProfile?.displayName}
                        className="object-cover transition-all duration-300"
                        onLoad={() => {
                          // Force re-render when image loads
                          setAvatarKey(prev => prev + 1)
                        }}
                        onError={() => {
                          console.log('Avatar image failed to load')
                          setImagePreview(null)
                        }}
                      />
                      <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {localProfile?.displayName?.charAt(0) || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload progress indicator */}
                    {imageUploadProgress > 0 && imageUploadProgress < 100 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="text-white text-sm font-medium">
                          {imageUploadProgress}%
                        </div>
                      </div>
                    )}
                    
                    {/* Loading overlay */}
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="absolute -bottom-2 -right-2 flex gap-1">
                      {/* Upload button */}
                      <label
                        htmlFor="avatar-upload"
                        className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl group-hover:bg-blue-700"
                        title="Change profile picture"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                      
                      {/* Refresh button */}
                      <button
                        type="button"
                        onClick={refreshAvatar}
                        disabled={refreshingAvatar || isLoading}
                        className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh avatar"
                      >
                        <RefreshCw className={`h-4 w-4 ${refreshingAvatar ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{localProfile?.displayName}</h3>
                    <p className="text-muted-foreground">@{localProfile?.username}</p>
                    <Badge variant="secondary" className="mt-2">
                      <Crown className="h-3 w-3 mr-1" />
                      {localProfile?.role}
                    </Badge>
                    {/* Upload status */}
                    {imageUploadProgress > 0 && imageUploadProgress < 100 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Uploading image... {imageUploadProgress}%
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                          <div 
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${imageUploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={localProfile?.displayName || ''}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={localProfile?.username || ''}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Enter your username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={localProfile?.email || ''}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={localProfile?.phone || ''}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={localProfile?.location || ''}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Enter your location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="institution" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Institution
                    </Label>
                    <Input
                      id="institution"
                      value={localProfile?.institution || ''}
                      onChange={(e) => setLocalProfile(prev => ({ ...prev, institution: e.target.value }))}
                      placeholder="Enter your institution"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Biography</Label>
                  <Textarea
                    id="bio"
                    value={localProfile?.bio || ''}
                    onChange={(e) => setLocalProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handlePasswordChange} disabled={isLoading}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Backup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Backup Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Download className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Backup Data</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create a complete backup of your system including all database tables, uploaded files, and system configuration.
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Backup includes:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Complete SQLite database (sada.db)</li>
                      <li>• All database tables and records</li>
                      <li>• Images and videos from upload directory</li>
                      <li>• User profiles and settings</li>
                    </ul>
                  </div>

                  {backupProgress && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        {backupLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm text-green-800 dark:text-green-200">{backupProgress}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="button"
                    onClick={handleBackupDownload}
                    disabled={backupLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {backupLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Backup...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download Backup
                      </>
                    )}
                  </Button>
                </div>

                <Separator className="my-6" />

                {/* Restore Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Upload className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Restore Data</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a backup file to restore your system data. This will replace all current data with the backup.
                  </p>

                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Warning</h4>
                        <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                          <li>• Restoring will replace ALL current data</li>
                          <li>• All database records will be overwritten</li>
                          <li>• Images and videos will be replaced</li>
                          <li>• This action cannot be undone</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="backup-file" className="text-sm font-medium">
                      Select Backup File (ZIP)
                    </Label>
                    <Input
                      id="backup-file"
                      type="file"
                      accept=".zip"
                      onChange={handleFileSelect}
                      disabled={restoreLoading}
                      className="cursor-pointer"
                    />
                    {selectedFile && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                    )}
                  </div>

                  {restoreProgress && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2">
                        {restoreLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <span className="text-sm text-green-800 dark:text-green-200">{restoreProgress}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="button"
                    onClick={handleRestore}
                    disabled={restoreLoading || !selectedFile}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {restoreLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Restoring Data...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Restore from Backup
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localProfile?.emailNotifications || false}
                    onChange={(e) => setLocalProfile(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="checkbox"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Alerts</Label>
                    <p className="text-sm text-muted-foreground">Show system alerts and warnings</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localProfile?.systemAlerts || false}
                    onChange={(e) => setLocalProfile(prev => ({ ...prev, systemAlerts: e.target.checked }))}
                    className="checkbox"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Backup Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about data backups</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localProfile?.backupReminders || false}
                    onChange={(e) => setLocalProfile(prev => ({ ...prev, backupReminders: e.target.checked }))}
                    className="checkbox"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handleProfileUpdate} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Image Cropper Dialog */}
      <ImageCropper
        isOpen={showImageCropper}
        onClose={() => {
          setShowImageCropper(false)
          setSelectedImageSrc(null)
        }}
        imageSrc={selectedImageSrc}
        onCropComplete={handleCropComplete}
        cropSize={{ width: 300, height: 300 }}
        aspectRatio={1}
      />
    </Dialog>
  )
}

export default ProfileManager