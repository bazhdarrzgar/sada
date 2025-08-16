import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'uploads'

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${uuidv4()}${fileExtension}`
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'upload', folder)
    await mkdir(uploadDir, { recursive: true })
    
    // Full file path
    const filePath = path.join(uploadDir, uniqueFilename)
    
    // Convert file to buffer and write to filesystem
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)
    
    // Return file URL and metadata
    const fileUrl = `/upload/${folder}/${uniqueFilename}`
    
    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type
    })
  } catch (error) {
    console.error('Upload error:', error)
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