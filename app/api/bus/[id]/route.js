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
      // Bus information
      busNumber: body.busNumber || '',
      busType: body.busType || '', 
      route: body.route || '',
      capacity: body.capacity || '',
      studentCount: body.studentCount || '',
      teacherCount: body.teacherCount || '',
      
      // Driver information
      driverName: body.driverName || '',
      driverPhone: body.driverPhone || '',
      driverLicense: body.driverLicense || '',
      driverPhoto: body.driverPhoto || null,
      driverLicensePhoto: body.driverLicensePhoto || null,
      driverVideos: body.driverVideos || [],
      
      // Notes
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