'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useProfile } from '@/components/profile/ProfileContext'
import ImageCropper from '@/components/ui/image-cropper'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function TestProfilePage() {
  const { profile, updateProfile } = useProfile()
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImageSrc, setSelectedImageSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

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
        
        // Update profile context
        await updateProfile({ ...profile, avatar: data.avatarUrl })
        
        toast.success('Avatar updated successfully!')
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
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Image Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Display */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 mx-auto">
                  <AvatarImage 
                    src={profile?.avatar} 
                    alt={profile?.displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile?.displayName?.charAt(0) || 'B'}
                  </AvatarFallback>
                </Avatar>
                
                <label
                  htmlFor="avatar-upload-test"
                  className="absolute -bottom-2 -right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-lg transition-colors"
                >
                  <Camera className="h-5 w-5" />
                </label>
                <input
                  id="avatar-upload-test"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold">{profile?.displayName || 'Loading...'}</h2>
                <p className="text-gray-600 dark:text-gray-400">@{profile?.username || 'loading'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {profile?.avatar ? 'Custom avatar uploaded' : 'Using default avatar'}
                </p>
              </div>
            </div>

            {/* Current Avatar URL */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold mb-2">Current Avatar URL:</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
                {profile?.avatar || 'No avatar uploaded'}
              </p>
            </div>

            {/* Test Instructions */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Test Instructions:</h3>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Click the camera icon to upload an image</li>
                <li>2. Use the image cropper to fit the image properly in the circle</li>
                <li>3. The image should now display properly without compression</li>
                <li>4. Go back to the homepage to see if the logo is updated</li>
              </ol>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>

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