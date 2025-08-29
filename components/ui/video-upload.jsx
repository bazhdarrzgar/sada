'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, X, Eye, Download, Video, Play, Pause, Volume2, VolumeX } from 'lucide-react'

export const VideoUpload = ({ 
  videos = [], 
  onVideosChange, 
  disabled = false,
  className = "",
  placeholder = "Upload Videos",
  maxVideos = 3
}) => {
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (!files.length) return

    // Check if adding these files would exceed the limit
    if (videos.length + files.length > maxVideos) {
      alert(`Maximum ${maxVideos} videos allowed. You can add ${maxVideos - videos.length} more.`)
      return
    }

    const validFiles = []
    
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert(`${file.name} is not a video file`)
        continue
      }

      // Validate file size (50MB limit for videos)
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum size is 50MB`)
        continue
      }

      validFiles.push(file)
    }

    if (!validFiles.length) return

    setUploading(true)

    try {
      const uploadPromises = validFiles.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'driver_videos')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          return {
            url: result.url,
            filename: result.filename,
            originalName: file.name,
            size: file.size,
            type: file.type
          }
        } else {
          const error = await response.json()
          console.error('Upload error:', error)
          throw new Error(`Failed to upload ${file.name}: ${error.error || error.message || 'Unknown error'}`)
        }
      })

      const uploadedVideos = await Promise.all(uploadPromises)
      const newVideos = [...videos, ...uploadedVideos]
      onVideosChange(newVideos)
      
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading videos: ' + error.message)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeVideo = (index) => {
    const newVideos = videos.filter((_, i) => i !== index)
    onVideosChange(newVideos)
  }

  const downloadVideo = (video) => {
    const link = document.createElement('a')
    link.href = video.url
    link.download = video.originalName || video.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const openPreview = (video) => {
    setPreviewVideo(video)
    setPreviewOpen(true)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || videos.length >= maxVideos}
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || videos.length >= maxVideos}
          className="w-full flex items-center justify-center gap-2 h-20 border-dashed"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              بارکردن / Uploading...
            </>
          ) : videos.length >= maxVideos ? (
            <div className="text-center">
              <Video className="h-6 w-6 mx-auto mb-1 text-gray-400" />
              <div className="text-sm">Maximum {maxVideos} videos reached</div>
            </div>
          ) : (
            <div className="text-center">
              <Video className="h-6 w-6 mx-auto mb-1 text-gray-400" />
              <div>{placeholder}</div>
              <div className="text-xs text-gray-500 mt-1">
                ڤیدیۆ بارکە ({videos.length}/{maxVideos})
              </div>
            </div>
          )}
        </Button>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-3">
                <div className="relative group">
                  <video
                    src={video.url}
                    className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75 transition-all duration-200"
                    onClick={() => openPreview(video)}
                    muted
                    preload="metadata"
                  />
                  
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-700 shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                      onClick={() => openPreview(video)}
                      title="بینینی ڤیدیۆ / Preview"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-6 w-6 p-0 bg-green-500/95 hover:bg-green-600 dark:bg-green-600/95 dark:hover:bg-green-500 shadow-lg backdrop-blur-sm border border-green-300/50 dark:border-green-500/50 text-white transition-all duration-200"
                      onClick={() => downloadVideo(video)}
                      title="داونلۆد / Download"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="h-6 w-6 p-0 bg-red-500/95 hover:bg-red-600 dark:bg-red-600/95 dark:hover:bg-red-500 shadow-lg backdrop-blur-sm border border-red-300/50 dark:border-red-500/50 text-white transition-all duration-200"
                      onClick={() => removeVideo(index)}
                      disabled={disabled}
                      title="سڕینەوە / Remove"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate" title={video.originalName || video.filename}>
                    {video.originalName || video.filename}
                  </p>
                  {video.size && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {(video.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Video Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(open) => {
        setPreviewOpen(open)
        if (!open) {
          setPreviewVideo(null)
          setIsPlaying(false)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-black/95 border-gray-700">
          <DialogHeader className="border-b border-gray-700 pb-4">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Video className="h-5 w-5" />
              {previewVideo?.originalName || 'Video Preview'}
            </DialogTitle>
          </DialogHeader>
          {previewVideo && (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={previewVideo.url}
                  className="w-full max-h-[70vh] object-contain mx-auto"
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onVolumeChange={(e) => setIsMuted(e.target.muted)}
                />
              </div>
              
              {/* Video controls and info */}
              <div className="flex justify-between items-center text-sm text-gray-300 bg-gray-800 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <strong>قەبارە:</strong> 
                    {previewVideo.size ? (previewVideo.size / 1024 / 1024).toFixed(1) + ' MB' : 'نەناسراو'}
                  </span>
                  <span className="flex items-center gap-2">
                    <strong>ناو:</strong> 
                    {previewVideo.originalName || previewVideo.filename}
                  </span>
                  {previewVideo.type && (
                    <span className="flex items-center gap-2">
                      <strong>جۆر:</strong> 
                      {previewVideo.type}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlay}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'وەستان' : 'کارپێکردن'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleMute}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    {isMuted ? 'دەنگ' : 'بێدەنگ'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadVideo(previewVideo)}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4" />
                    داونلۆد
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(false)}
                    className="flex items-center gap-2 bg-white/10 dark:bg-white/20 border-white/20 dark:border-white/30 text-white hover:bg-white/20 dark:hover:bg-white/30 transition-colors duration-200"
                  >
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

export default VideoUpload