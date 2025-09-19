'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

const EnhancedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = null,
  onLoad = () => {},
  onError = () => {},
  showRefresh = false,
  ...props 
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [imageSrc, setImageSrc] = useState(src)
  const [retryCount, setRetryCount] = useState(0)

  // Reset states when src changes
  useEffect(() => {
    setLoading(true)
    setError(false)
    setImageSrc(src)
    setRetryCount(0)
  }, [src])

  const handleLoad = () => {
    setLoading(false)
    setError(false)
    onLoad()
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
    
    // Try fallback if available and not already tried
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
      setLoading(true)
      setError(false)
      return
    }
    
    onError()
  }

  const handleRetry = () => {
    if (retryCount < 3) { // Limit retry attempts
      setRetryCount(prev => prev + 1)
      setLoading(true)
      setError(false)
      // Add cache busting parameter
      const cacheBustingSrc = `${src}?retry=${retryCount + 1}&t=${Date.now()}`
      setImageSrc(cacheBustingSrc)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
          <AlertCircle className="h-6 w-6 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500 text-center mb-2">Failed to load</span>
          {showRefresh && retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
              title="Retry loading image"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Actual image */}
      <img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        style={{ display: error ? 'none' : 'block' }}
        {...props}
      />
    </div>
  )
}

export default EnhancedImage