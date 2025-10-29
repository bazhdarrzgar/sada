import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all bus records
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('bus_records')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching bus records:', error)
    return NextResponse.json({ error: 'Failed to fetch bus records' }, { status: 500 })
  }
}

// POST create new bus record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const busRecord = {
      id: uuidv4(),
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
      
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('bus_records').insertOne(busRecord)
    
    // Remove _id for response
    const { _id, ...result } = busRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating bus record:', error)
    return NextResponse.json({ error: 'Failed to create bus record' }, { status: 500 })
  }
}