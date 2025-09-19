import { NextRequest, NextResponse } from 'next/server'
// Ensure Node.js runtime for filesystem access in production
export const runtime = 'nodejs'
// Prevent static optimization; this route must always run on the server
export const dynamic = 'force-dynamic'
import { writeFile, mkdir, access, constants } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

function getSafeExtension(type, originalName) {
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/avi': '.avi',
    'video/mov': '.mov',
    'video/wmv': '.wmv',
    'video/flv': '.flv',
    'video/webm': '.webm',
    'video/mkv': '.mkv'
  }
  const extFromMime = mimeToExt[type]
  const extFromName = path.extname(originalName || '')
  if (extFromMime) return extFromMime
  if (extFromName) return extFromName
  return ''
}

function bufferLooksLikeImage(buffer, type) {
  if (!buffer || buffer.length === 0) return false
  const b = buffer
  const startsWith = (arr) => arr.every((v, i) => b[i] === v)
  const asAscii = (start, len) => b.subarray(start, start + len).toString('ascii')
  if (type === 'image/png') {
    return startsWith([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
  }
  if (type === 'image/jpeg' || type === 'image/jpg') {
    return b[0] === 0xFF && b[1] === 0xD8 && b[b.length - 2] === 0xFF && b[b.length - 1] === 0xD9
  }
  if (type === 'image/gif') {
    const sig = asAscii(0, 6)
    return sig === 'GIF87a' || sig === 'GIF89a'
  }
  if (type === 'image/webp') {
    return asAscii(0, 4) === 'RIFF' && asAscii(8, 4) === 'WEBP'
  }
  if (type === 'image/bmp') {
    return asAscii(0, 2) === 'BM'
  }
  if (type === 'image/svg+xml') {
    const head = buffer.toString('utf8', 0, Math.min(64, buffer.length)).toLowerCase()
    return head.includes('<svg')
  }
  return true
}

function bufferLooksLikeVideo(buffer, type) {
  if (!buffer || buffer.length === 0) return false
  const asAscii = (start, len) => buffer.subarray(start, start + len).toString('ascii')
  if (type === 'video/mp4' || type === 'video/mov') {
    // MP4/MOV typically contain 'ftyp' at bytes 4-8
    return asAscii(4, 4) === 'ftyp'
  }
  if (type === 'video/webm' || type === 'video/mkv') {
    // EBML signature
    return buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3
  }
  if (type === 'video/avi') {
    return asAscii(0, 4) === 'RIFF' && asAscii(8, 3) === 'AVI'
  }
  // Fallback: require at least 1 KB to avoid empty/broken uploads
  return buffer.length > 1024
}

export async function POST(request) {
  try {
    console.log('🔄 Upload API called')
    console.log('🌍 Environment:', process.env.NODE_ENV)
    console.log('📂 Current working directory:', process.cwd())
    console.log('🏗️ Standalone mode detected:', process.env.__NEXT_PRIVATE_STANDALONE_CONFIG ? 'YES' : 'NO')
    
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'uploads'

    console.log(`📁 Upload request - File: ${file?.name}, Size: ${file?.size}, Folder: ${folder}`)

    if (!file || file.size === 0) {
      console.error('❌ No file provided or file is empty')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type (allow both images and videos)
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv']
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes]
    
    if (!allowedTypes.includes(file.type)) {
      console.error(`❌ Invalid file type: ${file.type}`)
      return NextResponse.json({ 
        error: `Invalid file type: ${file.type}. Only images and videos are allowed.` 
      }, { status: 400 })
    }

    // Validate file size - different limits for images and videos
    let maxSize
    if (allowedImageTypes.includes(file.type)) {
      maxSize = 5 * 1024 * 1024 // 5MB for images
    } else if (allowedVideoTypes.includes(file.type)) {
      maxSize = 50 * 1024 * 1024 // 50MB for videos
    }
    
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      console.error(`❌ File too large: ${file.size} bytes, max: ${maxSize} bytes`)
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${maxSizeMB}MB.` 
      }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = getSafeExtension(file.type, file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    
    // Get the upload directory path - handle both dev and standalone modes
    let uploadDir
    if (process.env.NODE_ENV === 'production' && process.env.__NEXT_PRIVATE_STANDALONE_CONFIG) {
      // In standalone mode, use the standalone public directory
      uploadDir = path.join(process.cwd(), 'public', 'upload', folder)
    } else {
      // In development or non-standalone production, use the main project directory
      uploadDir = path.join(process.cwd(), 'public', 'upload', folder)
    }
    
    console.log(`📂 Upload directory: ${uploadDir}`)
    console.log(`🏗️ Directory exists:`, require('fs').existsSync(uploadDir))
    
    try {
      // Create upload directory with proper permissions
      await mkdir(uploadDir, { recursive: true })
      console.log('✅ Upload directory created/verified')
      
      // For production environments, ensure proper permissions
      if (process.env.NODE_ENV === 'production') {
        try {
          // Check current permissions and ownership
          const stats = require('fs').statSync(uploadDir)
          console.log(`📊 Directory stats - Mode: ${stats.mode.toString(8)}, UID: ${stats.uid}, GID: ${stats.gid}`)
          
          // Try to set permissions on the upload directory
          await execAsync(`chmod -R 755 "${uploadDir}"`)
          console.log('✅ Permissions set for upload directory')
        } catch (permError) {
          console.warn('⚠️ Could not set directory permissions (might not be needed):', permError.message)
        }
      }
    } catch (dirError) {
      console.error('❌ Failed to create upload directory:', dirError)
      return NextResponse.json({ 
        error: 'Failed to create upload directory',
        details: dirError.message 
      }, { status: 500 })
    }
    
    // Full file path
    const filePath = path.join(uploadDir, uniqueFilename)
    console.log(`📄 File will be saved to: ${filePath}`)
    
    try {
      // Convert file to buffer and validate content
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      if (!buffer || buffer.length === 0) {
        console.error('❌ Empty file buffer after parsing form data')
        return NextResponse.json({ error: 'Empty file content' }, { status: 400 })
      }
      
      const isImage = ['image/jpeg','image/jpg','image/png','image/gif','image/webp','image/bmp','image/svg+xml'].includes(file.type)
      const isVideo = ['video/mp4','video/avi','video/mov','video/wmv','video/flv','video/webm','video/mkv'].includes(file.type)
      
      if (isImage && !bufferLooksLikeImage(buffer, file.type)) {
        console.error('❌ Uploaded image failed magic header validation')
        return NextResponse.json({ error: 'Invalid or corrupted image' }, { status: 400 })
      }
      if (isVideo && !bufferLooksLikeVideo(buffer, file.type)) {
        console.error('❌ Uploaded video failed basic validation')
        return NextResponse.json({ error: 'Invalid or corrupted video' }, { status: 400 })
      }
      
      console.log(`💾 Writing file buffer (${buffer.length} bytes)...`)
      await writeFile(filePath, buffer)
      console.log('✅ File written successfully')
      
      // Verify the file was actually written and get its size
      try {
        await access(filePath, constants.F_OK)
        const fileStats = require('fs').statSync(filePath)
        console.log(`✅ File verification successful - Size on disk: ${fileStats.size} bytes`)
        
        if (fileStats.size === 0) {
          console.error('❌ File written but has 0 bytes on disk!')
          throw new Error('File written but has 0 bytes - possible disk/permission issue')
        }
        
        if (fileStats.size !== buffer.length) {
          console.warn(`⚠️ Size mismatch - Buffer: ${buffer.length} bytes, Disk: ${fileStats.size} bytes`)
        }
      } catch (verifyError) {
        console.error('❌ File verification failed:', verifyError)
        throw new Error('File was not written correctly: ' + verifyError.message)
      }
    } catch (writeError) {
      console.error('❌ Failed to write file:', writeError)
      
      // Enhanced error handling for common Docker issues
      let errorMessage = 'Failed to write file'
      let errorDetails = writeError.message
      
      if (writeError.code === 'EACCES') {
        errorMessage = 'Permission denied - unable to write file'
        errorDetails = 'The server does not have permission to write to the upload directory. This is a Docker/permissions issue.'
      } else if (writeError.code === 'ENOSPC') {
        errorMessage = 'No space left on device'
        errorDetails = 'The server has run out of disk space.'
      } else if (writeError.code === 'ENOENT') {
        errorMessage = 'Upload directory does not exist'
        errorDetails = 'The upload directory could not be found or created.'
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: errorDetails,
        code: writeError.code || 'UNKNOWN'
      }, { status: 500 })
    }
    
    // Return file URL and metadata
    const fileUrl = `/upload/${folder}/${uniqueFilename}`
    console.log(`✅ Upload successful - URL: ${fileUrl}`)
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type
    })
    
  } catch (error) {
    console.error('❌ Upload error:', error)
    return NextResponse.json({ 
      error: 'Failed to upload file',
      details: error.message 
    }, { status: 500 })
  }
}

// GET method to serve uploaded files (optional, Next.js handles public files automatically)
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')
  const folder = searchParams.get('folder') || 'uploads'
  
  if (!filename) {
    return NextResponse.json({ error: 'Filename required' }, { status: 400 })
  }
  
  try {
    const filePath = path.join(process.cwd(), 'public', 'upload', folder, filename)
    // This would serve the file, but Next.js handles public files automatically
    return NextResponse.json({ 
      url: `/upload/${folder}/${filename}` 
    })
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}