'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Image as ImageIcon, RotateCw, Maximize2, Minimize2, Copy, Grid3x3, List, Info, Check } from 'lucide-react'
import * as DialogPrimitive from "@radix-ui/react-dialog"

export const ImageCarousel = ({ 
  images = [], 
  trigger, 
  scrollToCenter = false,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  initialIndex = 0
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState('single') // 'single' or 'grid'
  const [showInfo, setShowInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const triggerElementRef = useRef(null)

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = externalOnClose ? (value) => {
    if (!value) externalOnClose()
  } : setInternalIsOpen

  // Update currentIndex when initialIndex changes (for external control)
  useEffect(() => {
    if (externalIsOpen && initialIndex !== undefined) {
      setCurrentIndex(initialIndex)
    }
  }, [externalIsOpen, initialIndex])

  if (!images || images.length === 0) {
    return null
  }

  // Function to smoothly scroll to center before opening modal
  const scrollToCenterAndOpen = () => {
    if (scrollToCenter) {
      // Add fast-smooth-scroll class to html temporarily
      document.documentElement.classList.add('fast-smooth-scroll')
      
      // Calculate the center of the viewport relative to the entire document
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      )
      const viewportHeight = window.innerHeight
      
      // Calculate center position of the page (middle of the document)
      const centerPosition = Math.max(0, (documentHeight - viewportHeight) / 2)
      
      // Use immediate smooth scroll to center with enhanced options
      const scrollOptions = {
        top: centerPosition,
        behavior: 'smooth'
      }
      
      // For better browser compatibility, try both methods
      if ('scrollTo' in window) {
        window.scrollTo(scrollOptions)
      } else {
        // Fallback for older browsers
        window.scroll(scrollOptions)
      }
      
      // Open modal after a brief delay to let scroll animation start
      const timeout = setTimeout(() => {
        if (externalIsOpen === undefined) {
          setInternalIsOpen(true)
        }
        // Remove the fast-smooth-scroll class after opening
        document.documentElement.classList.remove('fast-smooth-scroll')
      }, 100)
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timeout)
    } else {
      if (externalIsOpen === undefined) {
        setInternalIsOpen(true)
      }
    }
  }

  // Reset zoom, rotation and position when image changes
  useEffect(() => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setImageLoaded(false)
  }, [currentIndex])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.originalName || image.filename || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Copy image to clipboard
  const copyImageToClipboard = async () => {
    try {
      const image = images[currentIndex]
      const response = await fetch(image.url)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy image:', err)
      // Fallback: copy URL instead
      try {
        await navigator.clipboard.writeText(images[currentIndex].url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (e) {
        alert('Failed to copy image')
      }
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  // Get current image info
  const getCurrentImageInfo = () => {
    const image = images[currentIndex]
    return {
      name: image.originalName || image.filename || 'Unknown',
      size: formatFileSize(image.size),
      uploadDate: image.uploadDate || 'N/A',
      index: currentIndex + 1,
      total: images.length
    }
  }

  // Mouse drag handlers for panning
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      
      switch(e.key) {
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case 'Escape':
          setIsOpen(false)
          break
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case 'r':
        case 'R':
          handleRotate()
          break
        case '0':
          handleReset()
          break
        case 'g':
        case 'G':
          setViewMode(prev => prev === 'single' ? 'grid' : 'single')
          break
        case 'i':
        case 'I':
          setShowInfo(prev => !prev)
          break
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            copyImageToClipboard()
          }
          break
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, currentIndex])

  return (
    <>
      {/* Trigger - Thumbnail Grid */}
      <div 
        ref={triggerElementRef}
        onClick={scrollToCenterAndOpen}
        className="cursor-pointer"
      >
        {trigger || (
          <div className="flex flex-wrap gap-1">
            {images.slice(0, 3).map((image, idx) => (
              <div key={idx} className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-blue-500 transition-all">
                <img 
                  src={image.url} 
                  alt={`Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {images.length > 3 && (
              <div className="w-12 h-12 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                +{images.length - 3}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Carousel Modal with High Z-Index */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay 
            className="fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            style={{ zIndex: 200 }}
          />
          <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] max-w-4xl max-h-[85vh] w-full p-0 bg-black/95 border-gray-800 overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg"
            style={{ zIndex: 201 }}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div 
              ref={containerRef}
              className="relative w-full h-[75vh] flex flex-col"
            >
            {/* Header with Controls */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-3 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm">
              <div className="flex items-center gap-3 text-white">
                <ImageIcon className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  {currentIndex + 1} / {images.length}
                </span>
                <span className="text-xs text-white/60 hidden sm:inline">
                  {images[currentIndex]?.originalName || images[currentIndex]?.filename}
                </span>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white text-xs px-2 min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotate}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title="Rotate (R)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all text-xs"
                  title="Reset (0)"
                >
                  1:1
                </Button>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode(prev => prev === 'single' ? 'grid' : 'single')}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title={viewMode === 'single' ? 'Grid View (G)' : 'Single View (G)'}
                >
                  {viewMode === 'single' ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(prev => !prev)}
                  className={`h-8 w-8 text-white hover:bg-white/20 transition-all ${showInfo ? 'bg-white/20' : ''}`}
                  title="Image Info (I)"
                >
                  <Info className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyImageToClipboard}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title="Copy Image (Ctrl+C)"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <div className="w-px h-6 bg-white/20 mx-1"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFullscreen}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title="Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadImage(images[currentIndex])}
                  className="h-8 w-8 text-white hover:bg-white/20 transition-all"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-red-500/50 transition-all"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'single' ? (
              /* Single Image View */
              <div 
                className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <div className="min-h-full flex items-center justify-center p-8 sm:p-12">
                  {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
                    </div>
                  )}
                  <img 
                    ref={imageRef}
                    src={images[currentIndex]?.url} 
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full h-auto object-contain rounded-lg shadow-2xl transition-all duration-200 select-none"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                      transformOrigin: 'center center',
                      opacity: imageLoaded ? 1 : 0
                    }}
                    onLoad={() => setImageLoaded(true)}
                    draggable={false}
                  />
                </div>

                {/* Image Info Panel */}
                {showInfo && (
                  <div className="absolute top-16 right-4 bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm max-w-xs z-30 border border-white/20">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Image Information
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-white/60">Name:</span>
                        <span className="text-right truncate max-w-[180px]" title={getCurrentImageInfo().name}>
                          {getCurrentImageInfo().name}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-white/60">Size:</span>
                        <span>{getCurrentImageInfo().size}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-white/60">Position:</span>
                        <span>{getCurrentImageInfo().index} of {getCurrentImageInfo().total}</span>
                      </div>
                      {getCurrentImageInfo().uploadDate !== 'N/A' && (
                        <div className="flex justify-between gap-4">
                          <span className="text-white/60">Uploaded:</span>
                          <span>{getCurrentImageInfo().uploadDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Grid View */
              <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx)
                        setViewMode('single')
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105 border-2 ${
                        idx === currentIndex
                          ? 'border-blue-500 ring-2 ring-blue-400'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                        <span className="text-white text-xs font-semibold">
                          {idx + 1}
                        </span>
                      </div>
                      {idx === currentIndex && (
                        <div className="absolute inset-0 bg-blue-500/20"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons - Only in Single View */}
            {images.length > 1 && viewMode === 'single' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/30 hover:border-white/60 transition-all z-10"
                  title="Previous (←)"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/30 hover:border-white/60 transition-all z-10"
                  title="Next (→)"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Thumbnail Navigation with Scroll */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent backdrop-blur-sm z-20">
              <div className="flex gap-2 justify-start overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent px-2">
                {images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      idx === currentIndex 
                        ? 'border-blue-500 ring-2 ring-blue-400 scale-110 shadow-lg shadow-blue-500/50' 
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === currentIndex && (
                      <div className="absolute inset-0 bg-blue-500/20"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="absolute bottom-28 left-4 text-white/40 text-xs hidden lg:block bg-black/50 p-2 rounded backdrop-blur-sm">
              <p className="font-semibold mb-1">Keyboard Shortcuts:</p>
              <p>← → (navigate) | + - (zoom) | R (rotate) | 0 (reset)</p>
              <p>G (grid view) | I (info) | Ctrl+C (copy) | Esc (close)</p>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
      </Dialog>
    </>
  )
}

export default ImageCarousel
