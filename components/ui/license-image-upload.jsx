'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, X, Eye, Download, Image as ImageIcon, Camera } from 'lucide-react'

export const LicenseImageUpload = ({ 
  image = null, 
  onImageChange, 
  disabled = false,
  className = "",
  placeholder = "Upload License Image"
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'license_images')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const imageData = {
          url: result.url,
          filename: result.filename,
          originalName: file.name,
          size: file.size
        }
        onImageChange(imageData)
      } else {
        const error = await response.json()
        console.error('Upload error:', error)
        alert(`Failed to upload image: ${error.message}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading image')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = () => {
    onImageChange(null)
  }

  const downloadImage = () => {
    if (image) {
      const link = document.createElement('a')
      link.href = image.url
      link.download = image.originalName || image.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button or Image Display */}
      {!image ? (
        // Upload state
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full flex items-center justify-center gap-2 h-32 border-dashed"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                بارکردن / Uploading...
              </>
            ) : (
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <div>{placeholder}</div>
                <div className="text-xs text-gray-500 mt-1">وێنەی سەنەوی بارکە</div>
              </div>
            )}
          </Button>
        </div>
      ) : (
        // Image display state
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-3">
            <div className="relative group">
              <img
                src={image.url}
                alt={image.originalName || 'License Image'}
                className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-75 transition-all duration-200 hover:scale-105"
                onClick={() => setPreviewOpen(true)}
              />
              
              {/* Overlay buttons */}
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 p-0 bg-black/70 dark:bg-white/90 hover:bg-black/90 dark:hover:bg-white text-white dark:text-black border-0 shadow-lg backdrop-blur-sm"
                  onClick={() => setPreviewOpen(true)}
                  title="بینینی وێنە / Preview"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 w-7 p-0 bg-green-500/95 hover:bg-green-600 dark:bg-green-600/95 dark:hover:bg-green-500 shadow-lg backdrop-blur-sm border border-green-300/50 dark:border-green-500/50 text-white transition-all duration-200"
                  onClick={downloadImage}
                  title="داونلۆد / Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-7 w-7 p-0 bg-red-500/95 hover:bg-red-600 dark:bg-red-600/95 dark:hover:bg-red-500 shadow-lg backdrop-blur-sm border border-red-300/50 dark:border-red-500/50 text-white transition-all duration-200"
                  onClick={removeImage}
                  disabled={disabled}
                  title="سڕینەوە / Remove"
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
      )}

      {/* Replace image button when image exists */}
      {image && (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                بارکردن
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                گۆڕینی وێنە / Replace Image
              </>
            )}
          </Button>
        </div>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <ImageIcon className="h-5 w-5" />
              وێنەی سەنەوی / License Image Preview
            </DialogTitle>
          </DialogHeader>
          {image && (
            <div className="space-y-4">
              <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={image.originalName || 'License Preview'}
                  className="w-full max-h-[70vh] object-contain mx-auto"
                  loading="lazy"
                />
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span>
                    <strong>قەبارە:</strong> 
                    {image.size ? (image.size / 1024).toFixed(1) + ' KB' : 'نەناسراو'}
                  </span>
                  <span>
                    <strong>ناو:</strong> 
                    {image.originalName || image.filename}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadImage}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    داونلۆد
                  </Button>
                  <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                    <X className="h-4 w-4" />
                    داخستن
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

export default LicenseImageUpload