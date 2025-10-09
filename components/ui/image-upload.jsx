'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Upload, X, Eye, Download, Camera } from 'lucide-react'
import ImageCarousel from '@/components/ui/image-carousel'

export const ImageUpload = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 6, 
  disabled = false,
  className = "" 
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewIndex, setPreviewIndex] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) {
      console.log('No files selected')
      return
    }

    console.log(`Selected ${files.length} files for upload`)

    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images. Currently have ${images.length}, trying to add ${files.length}.`)
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
        formData.append('folder', 'Image_Psl')

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
          let errorMessage = 'Unknown error'
          try {
            const error = await response.json()
            errorMessage = error.message || error.error || 'Upload failed'
            console.error('Upload error:', error)
          } catch (parseError) {
            console.error('Error parsing response:', parseError)
            errorMessage = `HTTP ${response.status}: ${response.statusText}`
          }
          alert(`Failed to upload ${file.name}: ${errorMessage}`)
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages])
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Error uploading images: ${error.message || 'Network or server error'}`)
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

  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.originalName || image.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openPreview = (index) => {
    setPreviewIndex(index)
    setPreviewOpen(true)
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
          className={`flex items-center gap-2 ${uploading ? 'opacity-75 cursor-not-allowed' : ''}`}
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

      {/* Images Grid with Enhanced Preview */}
      {images.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 dark:hover:shadow-2xl border-2 border-transparent hover:border-blue-400 dark:hover:border-blue-500 group">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    {/* Main Image - Click to preview */}
                    <div 
                      className="w-full h-full cursor-pointer"
                      onClick={() => openPreview(index)}
                    >
                      <img
                        src={image.url}
                        alt={image.originalName || `Image ${index + 1}`}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Gradient Overlay - Always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    
                    {/* Overlay buttons - Always visible on mobile, hover on desktop */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-10 w-10 p-0 rounded-full bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-700 shadow-xl backdrop-blur-md border-2 border-white/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          openPreview(index)
                        }}
                        title="Preview image"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-10 w-10 p-0 rounded-full bg-blue-500/95 hover:bg-blue-600 dark:bg-blue-600/95 dark:hover:bg-blue-500 shadow-xl backdrop-blur-md border-2 border-blue-300/50 dark:border-blue-500/50 text-white transition-all duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(image)
                        }}
                        title="Download image"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-10 w-10 p-0 rounded-full bg-red-500/95 hover:bg-red-600 dark:bg-red-600/95 dark:hover:bg-red-500 shadow-xl backdrop-blur-md border-2 border-red-300/50 dark:border-red-500/50 text-white transition-all duration-200 hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeImage(index)
                        }}
                        disabled={disabled}
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Image number badge */}
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full border border-white/40">
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Image Info Footer */}
                  <div className="p-3 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium" title={image.originalName || image.filename}>
                      {image.originalName || image.filename}
                    </p>
                    {image.size && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {(image.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Image Preview Modal */}
          <ImageCarousel 
            images={images}
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            initialIndex={previewIndex}
          />
        </>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="p-8 text-center">
            <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No images uploaded</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Click "Upload Images" to add up to {maxImages} receipt images
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

export default ImageUpload