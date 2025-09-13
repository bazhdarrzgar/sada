'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Crop, RotateCcw, ZoomIn, ZoomOut, Check, X, RotateCw, Move, Grid3X3, Maximize } from 'lucide-react'

const ImageCropper = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 1, // 1 for square (circle)
  cropSize = { width: 400, height: 400 } // Increased size for better preview
}) => {
  const [scale, setScale] = useState(0.5) // Start with a smaller default scale
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [initialScale, setInitialScale] = useState(0.5) // Store the calculated initial scale
  const [showGrid, setShowGrid] = useState(false) // Grid overlay toggle
  const [isProcessing, setIsProcessing] = useState(false) // Processing state
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  const drawImageOnCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    const { width, height } = cropSize
    
    canvas.width = width
    canvas.height = height
    
    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Set up transformation
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(position.x, position.y)
    
    // Draw image centered with better quality
    const imgWidth = image.naturalWidth
    const imgHeight = image.naturalHeight
    ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
    
    ctx.restore()
  }, [scale, position, rotation, cropSize])

  const handleMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setIsDragging(true)
      const rect = canvasRef.current.getBoundingClientRect()
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    const deltaX = (currentX - dragStart.x) / scale
    const deltaY = (currentY - dragStart.y) / scale
    
    setPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    
    setDragStart({ x: currentX, y: currentY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY * -0.01
    const newScale = Math.min(Math.max(0.5, scale + delta), 3)
    setScale(newScale)
  }

  const handleCropComplete = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsProcessing(true)
    
    // Create high-quality output
    const outputCanvas = document.createElement('canvas')
    const outputCtx = outputCanvas.getContext('2d')
    const outputSize = 512 // Higher resolution output
    
    outputCanvas.width = outputSize
    outputCanvas.height = outputSize
    
    // Enable high-quality rendering
    outputCtx.imageSmoothingEnabled = true
    outputCtx.imageSmoothingQuality = 'high'
    
    // Draw the cropped area to the output canvas
    const image = imageRef.current
    if (image) {
      outputCtx.save()
      outputCtx.translate(outputSize / 2, outputSize / 2)
      outputCtx.rotate((rotation * Math.PI) / 180)
      outputCtx.scale(scale, scale)
      outputCtx.translate(position.x, position.y)
      
      const imgWidth = image.naturalWidth
      const imgHeight = image.naturalHeight
      outputCtx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)
      
      outputCtx.restore()
    }
    
    // Use higher quality for better results
    outputCanvas.toBlob((blob) => {
      setIsProcessing(false)
      onCropComplete(blob)
    }, 'image/jpeg', 0.98) // Increased quality even more
  }

  const resetTransform = () => {
    setScale(initialScale) // Reset to the calculated initial scale instead of 1
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }

  // Draw image when parameters change
  React.useEffect(() => {
    if (imageSrc && imageRef.current) {
      drawImageOnCanvas()
    }
  }, [drawImageOnCanvas, imageSrc])

  // Set up image load handler
  React.useEffect(() => {
    if (imageSrc && imageRef.current) {
      imageRef.current.onload = () => {
        // Calculate initial scale to fit image in crop area
        const image = imageRef.current
        const imgWidth = image.naturalWidth
        const imgHeight = image.naturalHeight
        const cropWidth = cropSize.width
        const cropHeight = cropSize.height
        
        // Calculate scale to fit the image within the crop area (show full image initially)
        const scaleX = cropWidth / imgWidth
        const scaleY = cropHeight / imgHeight
        const calculatedInitialScale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond original size
        
        // Store and set the calculated initial scale
        setInitialScale(calculatedInitialScale)
        setScale(calculatedInitialScale)
        setPosition({ x: 0, y: 0 })
        setRotation(0)
        
        // Draw after setting initial scale
        setTimeout(() => drawImageOnCanvas(), 10)
      }
    }
  }, [imageSrc, cropSize.width, cropSize.height])

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crop className="h-6 w-6 text-blue-600" />
            Crop Profile Image
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Adjust your profile picture
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Enhanced Image cropper */}
          <div 
            ref={containerRef}
            className="relative mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden shadow-inner border-2 border-gray-200 dark:border-gray-700"
            style={{ width: cropSize.width, height: cropSize.height }}
          >
            {/* Enhanced Crop area overlay */}
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/60"></div>
              
              {/* Crop circle with enhanced styling */}
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-full bg-transparent shadow-lg"
                style={{ 
                  width: Math.min(cropSize.width - 40, cropSize.height - 40), 
                  height: Math.min(cropSize.width - 40, cropSize.height - 40),
                  boxShadow: 'inset 0 0 0 2px rgba(59, 130, 246, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.8)'
                }}
              >
                {/* Grid overlay */}
                {showGrid && (
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="border border-white/30" />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Center dot */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full opacity-60" />
              </div>
              
              {/* Corner guides */}
              <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white/40 rounded-tl"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white/40 rounded-tr"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white/40 rounded-bl"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white/40 rounded-br"></div>
            </div>
            
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-move transition-transform hover:scale-[1.01]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
            
            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Processing...</p>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Controls */}
          <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
            {/* Zoom Control */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Maximize className="h-4 w-4" />
                Zoom: {Math.round(scale * 100)}%
              </label>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                  className="px-2"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={0.1}
                  max={5}
                  step={0.05}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(Math.min(5, scale + 0.1))}
                  className="px-2"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => prev - 90)}
                  title="Rotate Left"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => prev + 90)}
                  title="Rotate Right"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle Grid"
                  className={showGrid ? 'bg-blue-50 border-blue-300 text-blue-700' : ''}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetTransform}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Reset All
              </Button>
            </div>
            
            {/* Instructions */}
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center space-y-1">
              <p className="flex items-center justify-center gap-1">
                <Move className="h-3 w-3" />
                Drag to move • Scroll to zoom • Use controls to adjust
              </p>
              <p>Position your image within the circle for the best result</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleCropComplete}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </DialogFooter>

        {/* Hidden image for processing */}
        {imageSrc && (
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source"
            className="hidden"
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ImageCropper