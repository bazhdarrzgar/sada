import { NextResponse } from 'next/server'
import clientPromise from '@/lib/sqlite'
import { writeFile, mkdir, access, constants } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { promisify } from 'util'
import { exec } from 'child_process'

const execAsync = promisify(exec)

// Ensure Node.js runtime for filesystem access in production
export const runtime = 'nodejs'
// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// POST - Upload user avatar
export async function POST(request) {
  try {
    console.log('🖼️ Profile Avatar Upload API called')
    console.log('👤 User: Profile avatar upload request received')
    console.log('📂 Current working directory:', process.cwd())
    console.log('🌍 Environment:', process.env.NODE_ENV)
    console.log('🏗️ Standalone mode detected:', process.env.__NEXT_PRIVATE_STANDALONE_CONFIG ? 'YES' : 'NO')
    
    const formData = await request.formData()
    const file = formData.get('avatar')
    
    console.log(`📁 Avatar upload request - File: ${file?.name}, Size: ${file?.size}`)
    
    if (!file) {
      console.error('❌ No avatar file provided')
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error(`❌ Invalid file type for avatar: ${file.type}`)
      return NextResponse.json({ message: 'File must be an image' }, { status: 400 })
    }
    
    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      console.error(`❌ Avatar file too large: ${file.size} bytes (limit: 2MB)`)
      return NextResponse.json({ message: 'File size must be less than 2MB' }, { status: 400 })
    }
    
    // Generate unique filename using UUID (same as working upload system)
    const fileExtension = path.extname(file.name) || '.jpg'
    const uniqueFilename = `avatar-${uuidv4()}${fileExtension}`
    
    // Get the upload directory path - use /upload/avatars/ to match working pattern
    let uploadDir
    if (process.env.NODE_ENV === 'production' && process.env.__NEXT_PRIVATE_STANDALONE_CONFIG) {
      // In standalone mode, use the standalone public directory
      uploadDir = path.join(process.cwd(), 'public', 'upload', 'avatars')
    } else {
      // In development or non-standalone production, use the main project directory
      uploadDir = path.join(process.cwd(), 'public', 'upload', 'avatars')
    }
    
    console.log(`📂 Avatar upload directory: ${uploadDir}`)
    console.log(`🏗️ Directory exists:`, require('fs').existsSync(uploadDir))
    
    try {
      // Create upload directory with proper permissions (same as working system)
      await mkdir(uploadDir, { recursive: true })
      console.log('✅ Avatar upload directory created/verified')
      
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
      
      // Verify directory is writable
      try {
        await access(uploadDir, constants.W_OK)
        console.log('✅ Avatar upload directory is writable')
      } catch (writeCheckError) {
        console.error('❌ Avatar upload directory is not writable:', writeCheckError)
        return NextResponse.json({ 
          error: 'Upload directory is not writable',
          details: writeCheckError.message 
        }, { status: 500 })
      }
      
    } catch (dirError) {
      console.error('❌ Failed to create upload directory:', dirError)
      return NextResponse.json({ 
        error: 'Failed to create upload directory',
        details: dirError.message 
      }, { status: 500 })
    }
    
    // Full file path
    const filepath = path.join(uploadDir, uniqueFilename)
    
    console.log(`📝 Generated avatar filename: ${uniqueFilename}`)
    console.log(`💾 Avatar file path: ${filepath}`)
    
    try {
      // Convert file to buffer and save (enhanced error handling like working system)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      if (!buffer || buffer.length === 0) {
        console.error('❌ Empty file buffer after parsing form data')
        return NextResponse.json({ error: 'Empty file content' }, { status: 400 })
      }
      
      console.log(`💾 Writing avatar file buffer (${buffer.length} bytes)...`)
      await writeFile(filepath, buffer)
      console.log('✅ Avatar file written successfully')
      
      // Verify the file was actually written and get its size (same as working system)
      try {
        await access(filepath, constants.F_OK)
        const fileStats = require('fs').statSync(filepath)
        console.log(`✅ Avatar file verification successful - Size on disk: ${fileStats.size} bytes`)
        
        if (fileStats.size === 0) {
          console.error('❌ Avatar file written but has 0 bytes on disk!')
          throw new Error('File written but has 0 bytes - possible disk/permission issue')
        }
        
        if (fileStats.size !== buffer.length) {
          console.warn(`⚠️ Size mismatch - Buffer: ${buffer.length} bytes, Disk: ${fileStats.size} bytes`)
        }
      } catch (verifyError) {
        console.error('❌ Avatar file verification failed:', verifyError)
        throw new Error('File was not written correctly: ' + verifyError.message)
      }
    } catch (writeError) {
      console.error('❌ Failed to write avatar file:', writeError)
      
      // Enhanced error handling for common Docker issues (same as working system)
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
    
    // Update database with new avatar URL - use /upload/avatars/ path (working pattern)
    const avatarUrl = `/upload/avatars/${uniqueFilename}`
    console.log(`🔗 Avatar URL: ${avatarUrl}`)
    
    const client = await clientPromise
    const db = client.db('sada')
    
    await db.collection('user_profiles').updateOne(
      { username: 'berdoz' },
      { 
        $set: { 
          avatar: avatarUrl,
          updated_at: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    )
    
    console.log(`✅ Avatar database updated successfully for user: berdoz`)
    console.log(`🎉 Profile avatar upload completed successfully - URL: ${avatarUrl}`)
    
    return NextResponse.json({ 
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl
    })
  } catch (error) {
    console.error('❌ Profile avatar upload error:', error)
    return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
  }
}
