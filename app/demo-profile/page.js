'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ImageCropper from '@/components/ui/image-cropper'
import { Camera, Upload, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function DemoProfilePage() {
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImageSrc, setSelectedImageSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState('')
  const [demoProfile] = useState({
    username: 'berdoz',
    displayName: 'Berdoz Administrator',
    email: 'admin@berdoz.edu.krd',
    role: 'System Administrator'
  })

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
    
    try {
      const formData = new FormData()
      formData.append('avatar', croppedBlob, 'avatar.jpg')

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentAvatar(data.avatarUrl)
        toast.success('Avatar updated successfully! 🎉')
      } else {
        throw new Error('Failed to upload avatar')
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Failed to upload avatar. Please try again.')
    } finally {
      setIsLoading(false)
      setSelectedImageSrc(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Image Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the new image cropping functionality for profile pictures
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Profile Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Current Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="h-32 w-32 mx-auto ring-4 ring-blue-500/20">
                    <AvatarImage 
                      src={currentAvatar} 
                      alt={demoProfile.displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {demoProfile.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <label
                    htmlFor="avatar-upload-demo"
                    className="absolute -bottom-2 -right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110"
                  >
                    <Camera className="h-5 w-5" />
                  </label>
                  <input
                    id="avatar-upload-demo"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold">{demoProfile.displayName}</h2>
                  <p className="text-gray-600 dark:text-gray-400">@{demoProfile.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {currentAvatar ? '✅ Custom avatar uploaded' : '📷 Using default avatar'}
                  </p>
                </div>
              </div>

              {/* Current Avatar Info */}
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-2">Avatar Status:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                  {currentAvatar || 'No custom avatar uploaded yet'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Homepage Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                Homepage Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Simulated Homepage Header */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="relative cursor-pointer group">
                    {currentAvatar ? (
                      <Avatar className="h-10 w-10 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ring-2 ring-blue-500/20 group-hover:ring-blue-500/40">
                        <AvatarImage 
                          src={currentAvatar} 
                          alt={demoProfile.displayName}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold">
                          {demoProfile.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-full shadow-lg">
                        <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Welcome {demoProfile.displayName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">✨ Features:</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• 🖼️ Upload any image format</li>
                  <li>• ✂️ Crop and resize with preview</li>
                  <li>• 🔄 Perfect circular fit (no compression)</li>
                  <li>• 🔗 Automatically syncs to homepage logo</li>
                  <li>• 💾 Saves to server with proper quality</li>
                </ul>
              </div>

              {/* Test Instructions */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">🧪 How to Test:</h3>
                <ol className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>1. Click the camera icon on the left</li>
                  <li>2. Select an image from your device</li>
                  <li>3. Use the cropper to position/resize</li>
                  <li>4. Click "Apply Crop" to save</li>
                  <li>5. See the image update in both places!</li>
                </ol>
              </div>

              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
                variant="outline"
              >
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>

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
      </div>
    </div>
  )
}