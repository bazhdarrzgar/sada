import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET single bus record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('bus_records').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Bus record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching bus record:', error)
    return NextResponse.json({ error: 'Failed to fetch bus record' }, { status: 500 })
  }
}

// PUT update bus record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const updateData = {
      // Student passenger info
      studentFullName: body.studentFullName || '',
      studentClass: body.studentClass || '',
      studentMobile: body.studentMobile || '',
      studentAddress: body.studentAddress || '',
      
      // Teacher info
      teacherFullName: body.teacherFullName || '',
      teacherMobile: body.teacherMobile || '',
      teacherAddress: body.teacherAddress || '',
      teachingExperience: body.teachingExperience || '',
      teacherClass: body.teacherClass || '',
      
      // Bus driver info
      driverFullName: body.driverFullName || '',
      driverLicenseImage: body.driverLicenseImage || '',
      driverPhoto: body.driverPhoto || '', // New field: وێنەی سایەق
      driverLicensePhoto: body.driverLicensePhoto || '', // New field: وێنەی ئیجازەی
      driverVideos: body.driverVideos || [], // New field: دانانی ڤیدیۆ
      driverMobile: body.driverMobile || '',
      driverAddress: body.driverAddress || '',
      
      // Notes field
      notes: body.notes || '',
      
      updated_at: new Date()
    }
    
    const result = await db.collection('bus_records').updateOne(
      { id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Bus record not found' }, { status: 404 })
    }
    
    const updatedRecord = await db.collection('bus_records').findOne({ id })
    const { _id, ...response } = updatedRecord
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating bus record:', error)
    return NextResponse.json({ error: 'Failed to update bus record' }, { status: 500 })
  }
}

// DELETE bus record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('bus_records').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Bus record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Bus record deleted successfully' })
  } catch (error) {
    console.error('Error deleting bus record:', error)
    return NextResponse.json({ error: 'Failed to delete bus record' }, { status: 500 })
  }
}