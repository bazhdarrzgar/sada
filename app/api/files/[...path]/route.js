import { NextRequest, NextResponse } from 'next/server'
import { readFile, access, constants } from 'fs/promises'
import path from 'path'
import { lookup } from 'mime-types'

export const runtime = 'nodejs'

export async function GET(request, { params }) {
  try {
    console.log('🔄 File serving API called')
    console.log('📁 Requested path:', params.path)
    
    // Reconstruct the file path from the dynamic route
    const filePath = params.path.join('/')
    console.log('📄 Full file path:', filePath)
    
    // Security check - ensure the path is within the upload directory
    if (!filePath.startsWith('upload/')) {
      console.error('❌ Invalid file path - not in upload directory')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Full filesystem path
    const fullPath = path.join(process.cwd(), 'public', filePath)
    console.log('💾 Filesystem path:', fullPath)
    
    try {
      // Check if file exists
      await access(fullPath, constants.R_OK)
      
      // Read the file
      const fileBuffer = await readFile(fullPath)
      console.log(`✅ File read successfully - Size: ${fileBuffer.length} bytes`)
      
      // Determine content type
      const contentType = lookup(fullPath) || 'application/octet-stream'
      console.log('📋 Content type:', contentType)
      
      // Return file with appropriate headers
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    } catch (fileError) {
      console.error('❌ File access error:', fileError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('❌ File serving error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}