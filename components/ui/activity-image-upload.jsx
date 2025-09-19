'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, X, Eye, Download, Image as ImageIcon, Camera } from 'lucide-react'

export const ActivityImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 5, 
  disabled = false,
  className = "" 
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`)
      return
    }

    setUploading(true)
    const newImages = []

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image`)
          continue
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 5MB`)
          continue
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'Image_Activity')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          newImages.push({
            url: result.url,
            filename: result.filename,
            originalName: file.name,
            size: file.size
          })
        } else {
          const error = await response.json()
          console.error('Upload error:', error)
          alert(`Failed to upload ${file.name}: ${error.message}`)
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading images')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const openPreview = (image) => {
    setPreviewImage(image)
  }

  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.originalName || image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || images.length >= maxImages}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || images.length >= maxImages}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Images ({images.length}/{maxImages})
            </>
          )}
        </Button>

        {images.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {images.length} image{images.length !== 1 ? 's' : ''} uploaded
          </span>
        )}
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 dark:hover:shadow-xl">
              <CardContent className="p-2">
                <div className="relative group">
                  <img
                    src={image.url}
                    alt={image.originalName || `Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-75 transition-all duration-200 hover:scale-105"
                    onClick={() => openPreview(image)}
                  />
                  
                  {/* Overlay buttons */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-700 shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                      onClick={() => openPreview(image)}
                      title="Preview image"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0 bg-blue-500/95 hover:bg-blue-600 dark:bg-blue-600/95 dark:hover:bg-blue-500 shadow-lg backdrop-blur-sm border border-blue-300/50 dark:border-blue-500/50 text-white transition-all duration-200"
                      onClick={() => downloadImage(image)}
                      title="Download image"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-7 w-7 p-0 bg-red-500/95 hover:bg-red-600 dark:bg-red-600/95 dark:hover:bg-red-500 shadow-lg backdrop-blur-sm border border-red-300/50 dark:border-red-500/50 text-white transition-all duration-200"
                      onClick={() => removeImage(index)}
                      disabled={disabled}
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={image.originalName || image.filename}>
                    {image.originalName || image.filename}
                  </p>
                  {image.size && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(image.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No activity images uploaded</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click "Upload Images" to add up to {maxImages} activity images
            </p>
          </CardContent>
        </Card>
      )}

      {/* Optimized In-Page Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5" />
              {previewImage?.originalName || 'Activity Image Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              {/* Full size image with optimized viewing */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <img
                  src={previewImage.url}
                  alt={previewImage.originalName || 'Preview'}
                  className="w-full max-h-[75vh] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              
              {/* Image details and actions */}
              <div className="flex justify-between items-center text-sm text-gray-300 bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <strong>Size:</strong> 
                    {previewImage.size ? (previewImage.size / 1024).toFixed(1) + ' KB' : 'Unknown'}
                  </span>
                  <span className="flex items-center gap-2">
                    <strong>Name:</strong> 
                    {previewImage.originalName || previewImage.filename}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage(previewImage)}
                    className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewImage(null)}
                    className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <X className="h-4 w-4" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ActivityImageUpload