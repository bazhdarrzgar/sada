'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useZoom } from '@/components/ui/zoom-context'

export function ZoomControls({ variant = 'default', size = 'sm', className = '' }) {
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useZoom()

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* Zoom Out Button */}
      <Button
        variant={variant === 'ghost' ? 'ghost' : 'outline'}
        size={size}
        onClick={zoomOut}
        disabled={zoomLevel <= 50}
        className="h-9 w-9 p-0 rounded-full hover:scale-105 transition-all duration-200"
        title={`Zoom Out (${zoomLevel}%) / کەمکردنەوەی نواندن`}
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      {/* Zoom Level Display */}
      <Button
        variant={variant === 'ghost' ? 'ghost' : 'outline'}
        size={size}
        onClick={resetZoom}
        className="h-9 px-2 min-w-[50px] text-xs font-medium hover:scale-105 transition-all duration-200"
        title="Reset Zoom (100%) / ڕێکخستنەوەی نواندن"
        aria-label={`Current zoom level: ${zoomLevel}%. Click to reset`}
      >
        {zoomLevel}%
      </Button>

      {/* Zoom In Button */}
      <Button
        variant={variant === 'ghost' ? 'ghost' : 'outline'}
        size={size}
        onClick={zoomIn}
        disabled={zoomLevel >= 200}
        className="h-9 w-9 p-0 rounded-full hover:scale-105 transition-all duration-200"
        title={`Zoom In (${zoomLevel}%) / زیادکردنی نواندن`}
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      {/* Reset Button (optional, can be hidden for compact layout) */}
      {variant !== 'compact' && (
        <Button
          variant={variant === 'ghost' ? 'ghost' : 'outline'}
          size={size}
          onClick={resetZoom}
          className="h-9 w-9 p-0 rounded-full hover:scale-105 transition-all duration-200 ml-1"
          title="Reset Zoom to 100% / ڕێکخستنەوە بۆ ١٠٠٪"
          aria-label="Reset zoom to 100%"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

// Compact version for space-constrained areas
export function CompactZoomControls({ className = '' }) {
  return (
    <ZoomControls 
      variant="compact" 
      size="sm" 
      className={className}
    />
  )
}

// Ghost variant for transparent backgrounds
export function GhostZoomControls({ className = '' }) {
  return (
    <ZoomControls 
      variant="ghost" 
      size="sm" 
      className={className}
    />
  )
}