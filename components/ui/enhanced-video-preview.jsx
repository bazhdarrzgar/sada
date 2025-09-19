'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Eye, 
  Download, 
  Video, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward, 
  X,
  Clock,
  FileVideo,
  Share,
  RotateCcw,
  Settings,
  Layers,
  Monitor
} from 'lucide-react'

export const EnhancedVideoPreview = ({ 
  videos = [], 
  triggerButton = null,
  className = "" 
}) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [loading, setLoading] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showPlaylist, setShowPlaylist] = useState(false)
  
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

  const scrollToCenter = () => {
    const viewport = window.innerHeight
    const centerPosition = document.documentElement.scrollHeight / 2 - viewport / 2
    
    window.scrollTo({
      top: Math.max(0, centerPosition),
      behavior: 'smooth'
    })
  }

  const openPreview = (startIndex = 0) => {
    // First scroll to center quickly, then open modal
    scrollToCenter()
    
    // Small delay to allow smooth scroll to start before opening modal
    setTimeout(() => {
      setCurrentVideoIndex(startIndex)
      setPreviewOpen(true)
      setIsPlaying(false)
      setCurrentTime(0)
      setLoading(true)
    }, 200)
  }

  const closePreview = () => {
    setPreviewOpen(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setShowControls(true)
    setShowPlaylist(false)
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

  const changeVideo = (index) => {
    if (index >= 0 && index < videos.length) {
      setCurrentVideoIndex(index)
      setCurrentTime(0)
      setIsPlaying(false)
      setLoading(true)
    }
  }

  const nextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      changeVideo(currentVideoIndex + 1)
    }
  }

  const previousVideo = () => {
    if (currentVideoIndex > 0) {
      changeVideo(currentVideoIndex - 1)
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

  const downloadVideo = (video) => {
    const link = document.createElement('a')
    link.href = video.url
    link.download = video.originalName || video.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const currentIndex = rates.indexOf(playbackRate)
    const nextRate = rates[(currentIndex + 1) % rates.length]
    setPlaybackRate(nextRate)
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
    }
  }

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const currentVideo = videos[currentVideoIndex]

  // Render the trigger button or custom component
  const renderTrigger = () => {
    if (triggerButton) {
      return React.cloneElement(triggerButton, {
        onClick: () => openPreview(0)
      })
    }

    // Default eye icon button for table cells
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1 justify-center">
          {videos.slice(0, 3).map((video, index) => (
            <Button
              key={index}
              size="sm"
              variant="ghost"
              onClick={() => openPreview(index)}
              className="h-8 w-8 p-0 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-700 rounded-lg transition-all duration-200 hover:scale-110 group"
              title={`بینینی ڤیدیۆ: ${video.originalName || video.filename}`}
            >
              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
            </Button>
          ))}
          {videos.length > 3 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openPreview(0)}
              className="h-8 px-2 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg"
              title={`${videos.length - 3} more videos`}
            >
              +{videos.length - 3}
            </Button>
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {videos.length} ڤیدیۆ
        </span>
      </div>
    )
  }

  if (!videos || videos.length === 0) {
    return <span className="text-gray-400 text-sm">-</span>
  }

  return (
    <div className={className}>
      {renderTrigger()}

      {/* Enhanced Video Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={closePreview}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-auto p-0 bg-black border-0 shadow-2xl">
          {/* Header */}
          <DialogHeader className="absolute top-4 left-6 right-6 z-50 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {currentVideo?.originalName || 'Video Preview'}
                  </h3>
                  <p className="text-sm text-gray-300 opacity-80">
                    {videos.length > 1 && `${currentVideoIndex + 1} of ${videos.length} • `}
                    {currentVideo?.size ? `${(currentVideo.size / 1024 / 1024).toFixed(1)} MB` : ''} • 
                    {currentVideo?.type || ''}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {videos.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPlaylist(!showPlaylist)}
                    className="text-white hover:bg-white/20 h-8 px-3 rounded-lg flex items-center gap-2"
                  >
                    <Layers className="h-4 w-4" />
                    Playlist
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closePreview}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Playlist Sidebar */}
          {showPlaylist && videos.length > 1 && (
            <div className="absolute top-0 right-0 w-80 h-full bg-black/90 backdrop-blur-md border-l border-white/10 z-40 overflow-y-auto">
              <div className="p-4 pt-20">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Video Playlist ({videos.length})
                </h3>
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div
                      key={index}
                      onClick={() => changeVideo(index)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        index === currentVideoIndex 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                          <Video className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {video.originalName || video.filename}
                          </p>
                          <p className="text-xs opacity-70">
                            {video.size ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : ''}
                          </p>
                        </div>
                        {index === currentVideoIndex && (
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentVideo && (
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
                src={currentVideo.url}
                className="w-full max-h-[80vh] object-contain"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration)
                    videoRef.current.playbackRate = playbackRate
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
                onEnded={() => {
                  setIsPlaying(false)
                  if (videos.length > 1 && currentVideoIndex < videos.length - 1) {
                    setTimeout(() => nextVideo(), 1000)
                  }
                }}
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
                    {/* Playlist Navigation */}
                    {videos.length > 1 && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={previousVideo}
                          disabled={currentVideoIndex === 0}
                          className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full disabled:opacity-50"
                        >
                          <SkipBack className="h-5 w-5" />
                        </Button>
                      </div>
                    )}

                    {/* Primary Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={skipBackward}
                        className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full hover:scale-110 transition-all duration-200"
                      >
                        <RotateCcw className="h-5 w-5" />
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

                    {videos.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={nextVideo}
                        disabled={currentVideoIndex === videos.length - 1}
                        className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-full disabled:opacity-50"
                      >
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    )}

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
                      onClick={changePlaybackRate}
                      className="text-white hover:bg-white/20 h-10 px-3 rounded-lg flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="text-sm">{playbackRate}x</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadVideo(currentVideo)}
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

export default EnhancedVideoPreview