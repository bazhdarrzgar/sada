'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const ZoomContext = createContext()

export function useZoom() {
  const context = useContext(ZoomContext)
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider')
  }
  return context
}

export function ZoomProvider({ children }) {
  const [zoomLevel, setZoomLevel] = useState(100)

  // Load zoom level from localStorage on mount
  useEffect(() => {
    const savedZoom = localStorage.getItem('app-zoom-level')
    if (savedZoom) {
      const zoom = parseInt(savedZoom, 10)
      if (zoom >= 50 && zoom <= 200) {
        setZoomLevel(zoom)
      }
    }
  }, [])

  // Save zoom level to localStorage and apply to document
  useEffect(() => {
    localStorage.setItem('app-zoom-level', zoomLevel.toString())
    
    // Apply zoom to the document body
    if (typeof document !== 'undefined') {
      document.body.style.zoom = `${zoomLevel}%`
      // Also apply transform for better browser compatibility
      document.body.style.transform = `scale(${zoomLevel / 100})`
      document.body.style.transformOrigin = 'top left'
      
      // Adjust body width to accommodate scaling
      if (zoomLevel !== 100) {
        document.body.style.width = `${100 / (zoomLevel / 100)}%`
      } else {
        document.body.style.width = ''
      }
    }
  }, [zoomLevel])

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200)) // Max 200%
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50)) // Min 50%
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  const value = {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel
  }

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  )
}