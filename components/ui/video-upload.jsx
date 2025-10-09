'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, X, Eye, Download, Video, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Clock, FileVideo, Monitor } from 'lucide-react'

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
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const controlsTimeoutRef = useRef(null)

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    const resetControlsTimeout = () => {
      clearTimeout(controlsTimeoutRef.current)
      setShowControls(true)
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    if (previewOpen && isPlaying) {
      resetControlsTimeout()
    } else {
      setShowControls(true)
    }

    return () => clearTimeout(controlsTimeoutRef.current)
  }, [previewOpen, isPlaying])

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
    setCurrentTime(0)
    setLoading(true)
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

  const toggleFullscreen = () => {
    if (!isFullscreen && videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10)
    }
  }

  const handleProgressChange = (e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    const time = pos * duration
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Upload Section with Drag & Drop + Upload Button */}
      <div className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || uploading || videos.length >= maxVideos}
        />
        
        {/* Drag and Drop Area */}
        <div className="relative group">
          <div
            className="w-full flex items-center justify-center gap-3 h-32 border-2 border-dashed border-blue-300 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900 dark:hover:to-indigo-900 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              e.currentTarget.classList.add('border-blue-500', 'bg-blue-100', 'dark:bg-blue-900')
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100', 'dark:bg-blue-900')
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.currentTarget.classList.remove('border-blue-500', 'bg-blue-100', 'dark:bg-blue-900')
              const files = Array.from(e.dataTransfer.files)
              if (files.length > 0) {
                // Create a fake event to trigger file selection
                const fakeEvent = { target: { files } }
                handleFileSelect(fakeEvent)
              }
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-sm font-medium">بارکردن / Uploading...</div>
                <div className="text-xs text-gray-500">Processing videos...</div>
              </div>
            ) : videos.length >= maxVideos ? (
              <div className="text-center">
                <FileVideo className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <div className="text-sm font-medium">Maximum {maxVideos} videos reached</div>
                <div className="text-xs text-gray-500">Remove a video to add more</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="relative">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">Drag & Drop Videos Here</div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                  ڤیدیۆ بکێشە ئێرە یان کلیک بکە ({videos.length}/{maxVideos})
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Drag & drop videos here • Max 50MB each
                </div>
              </div>
            )}
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
        </div>

        {/* Upload Button */}
        <div className="flex justify-center">
          <Button
            type="button"
            variant="default"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading || videos.length >= maxVideos}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Upload className="h-5 w-5" />
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                بارکردن... / Uploading...
              </>
            ) : (
              <>
                بارکردنی ڤیدیۆ / Upload Videos
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Enhanced Videos Grid */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Uploaded Videos ({videos.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <Card key={index} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="relative overflow-hidden rounded-xl">
                    <video
                      src={video.url}
                      className="w-full h-32 object-cover cursor-pointer transition-all duration-300 group-hover:scale-105"
                      onClick={() => openPreview(video)}
                      muted
                      preload="metadata"
                    />
                    
                    {/* Enhanced overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-xl">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play className="h-6 w-6 text-white drop-shadow-lg" />
                      </div>
                    </div>
                    
                    {/* Enhanced action buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-700 shadow-lg backdrop-blur-sm border-0 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-110"
                        onClick={() => openPreview(video)}
                        title="بینینی ڤیدیۆ / Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-green-500/90 hover:bg-green-600 shadow-lg backdrop-blur-sm border-0 text-white transition-all duration-200 hover:scale-110"
                        onClick={() => downloadVideo(video)}
                        title="داونلۆد / Download"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg backdrop-blur-sm border-0 text-white transition-all duration-200 hover:scale-110"
                        onClick={() => removeVideo(index)}
                        disabled={disabled}
                        title="سڕینەوە / Remove"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {video.duration || '--:--'}
                    </div>
                  </div>
                  
                  {/* Enhanced video info */}
                  <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={video.originalName || video.filename}>
                      {video.originalName || video.filename}
                    </h4>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FileVideo className="h-3 w-3" />
                        {video.type?.split('/')[1]?.toUpperCase() || 'VIDEO'}
                      </span>
                      {video.size && (
                        <span className="font-medium">
                          {(video.size / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Video Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={(open) => {
        setPreviewOpen(open)
        if (!open) {
          setPreviewVideo(null)
          setIsPlaying(false)
          setCurrentTime(0)
          setShowControls(true)
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-black border-0 shadow-2xl">
          <DialogHeader className="absolute top-4 left-6 right-6 z-50 bg-black/70 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{previewVideo?.originalName || 'Video Preview'}</h3>
                  <p className="text-sm text-gray-300 opacity-80">
                    {previewVideo?.size ? `${(previewVideo.size / 1024 / 1024).toFixed(1)} MB` : ''} • 
                    {previewVideo?.type || ''}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen(false)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {previewVideo && (
            <div className="relative bg-black min-h-[60vh] flex items-center justify-center">
              {/* Loading state */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
                  <div className="text-center text-white">
                    <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">Loading video...</p>
                  </div>
                </div>
              )}

              {/* Video Player */}
              <video
                ref={videoRef}
                src={previewVideo.url}
                className="w-full max-h-[80vh] object-contain"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration)
                    setLoading(false)
                  }
                }}
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime)
                  }
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onVolumeChange={(e) => {
                  setIsMuted(e.target.muted)
                  setVolume(e.target.volume)
                }}
                onClick={togglePlay}
                onMouseMove={() => setShowControls(true)}
              />
              
              {/* Enhanced Custom Controls */}
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
                
                {/* Progress Bar */}
                <div 
                  ref={progressRef}
                  className="w-full h-2 bg-white/20 rounded-full mb-4 cursor-pointer group/progress hover:h-3 transition-all duration-200"
                  onClick={handleProgressChange}
                >
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative transition-all duration-100 group-hover/progress:from-blue-400 group-hover/progress:to-blue-500"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-200"></div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-4">
                    {/* Primary Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={skipBackward}
                        className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full hover:scale-110 transition-all duration-200"
                      >
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={togglePlay}
                        className="text-white hover:bg-white/20 h-14 w-14 p-0 rounded-full bg-white/10 backdrop-blur-sm hover:scale-110 transition-all duration-200"
                      >
                        {isPlaying ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={skipForward}
                        className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full hover:scale-110 transition-all duration-200"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full"
                      >
                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </Button>
                      <div className="w-20 h-1 bg-white/20 rounded-full hidden md:block">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-100"
                          style={{ width: `${volume * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Time Display */}
                    <div className="text-sm font-medium hidden sm:block">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  {/* Secondary Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadVideo(previewVideo)}
                      className="text-white hover:bg-white/20 h-10 px-4 rounded-lg flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">داونلۆد</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-lg"
                    >
                      {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                  </div>
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