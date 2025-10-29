/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Enable experimental features for better file handling
  experimental: {
    serverComponentsExternalPackages: ['multer', 'better-sqlite3']
  },
  
  // Configure static file serving
  staticPageGenerationTimeout: 1000,
  
  // Optimize images and allow external domains if needed
  images: {
    domains: ['localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  
  // Configure headers for file uploads and security
  async headers() {
    return [
      {
        source: '/api/upload',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type'
          }
        ]
      },
      {
        source: '/api/backup',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/zip'
          }
        ]
      },
      {
        source: '/upload/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  },
  
  // Configure rewrites for better file serving
  async rewrites() {
    return [
      {
        source: '/upload/:path*',
        destination: '/api/files/upload/:path*'
      }
    ]
  },
  
  // Webpack configuration for better file handling
  webpack: (config) => {
    // Add support for file uploads
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    return config
  },
  
  // PoweredBy header
  poweredByHeader: false
}

module.exports = nextConfig
