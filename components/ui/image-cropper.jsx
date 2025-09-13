'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Crop, RotateCcw, ZoomIn, ZoomOut, Check, X } from 'lucide-react'

const ImageCropper = ({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  aspectRatio = 1, // 1 for square (circle)
  cropSize = { width: 300, height: 300 }
}) => {
  const [scale, setScale] = useState(0.5) // Start with a smaller default scale
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [initialScale, setInitialScale] = useState(0.5) // Store the calculated initial scale
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
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Set up transformation
    ctx.save()
    ctx.translate(width / 2, height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)
    ctx.translate(position.x, position.y)
    
    // Draw image centered
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

    // Use higher quality for better results
    canvas.toBlob((blob) => {
      onCropComplete(blob)
    }, 'image/jpeg', 0.95) // Increased quality from 0.9 to 0.95
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Profile Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Image cropper */}
          <div 
            ref={containerRef}
            className="relative mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
            style={{ width: cropSize.width, height: cropSize.height }}
          >
            {/* Crop area overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/50"></div>
              <div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full bg-transparent"
                style={{ 
                  width: Math.min(cropSize.width - 20, cropSize.height - 20), 
                  height: Math.min(cropSize.width - 20, cropSize.height - 20) 
                }}
              ></div>
            </div>
            
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            />
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ZoomOut className="h-4 w-4" />
              <Slider
                value={[scale]}
                onValueChange={(value) => setScale(value[0])}
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="h-4 w-4" />
            </div>
            
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRotation(prev => prev - 90)}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetTransform}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleCropComplete}>
            <Check className="h-4 w-4 mr-2" />
            Apply Crop
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