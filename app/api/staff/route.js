import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all تۆمارەکانی ستاف
export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Get search parameter from URL
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')
    
    let filter = {}
    
    // If search term exists, create search filter using actual database column names
    if (searchTerm && searchTerm.trim()) {
      // Search across multiple fields using the actual column names in the database
      filter = {
        $or: [
          { fullName: { $regex: searchTerm } },
          { mobile: { $regex: searchTerm } },
          { address: { $regex: searchTerm } },
          { department: { $regex: searchTerm } },
          { certificate: { $regex: searchTerm } },
          { education: { $regex: searchTerm } },
          { gender: { $regex: searchTerm } }
        ]
      }
    }
    
    const records = await db.collection('staff_records')
      .find(filter)
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Return records with correct field names (matching database schema)
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching تۆمارەکانی ستاف:', error)
    return NextResponse.json({ error: 'Failed to fetch تۆمارەکانی ستاف' }, { status: 500 })
  }
}

// POST create new staff record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const staffRecord = {
      id: uuidv4(),
      fullName: body.fullName || '',
      mobile: body.mobile || '',
      address: body.address || '',
      gender: body.gender || '',
      dateOfBirth: body.dateOfBirth || '',
      certificate: body.certificate || '',
      age: body.age ? parseInt(body.age) : 0,
      education: body.education || '',
      attendance: body.attendance || 'Present',
      date: body.date || new Date().toISOString().split('T')[0],
      department: body.department || '',
      bloodType: body.bloodType || '',
      certificateImages: JSON.stringify(body.certificateImages || []),
      notes: body.notes || '',
      pass: body.pass || '',
      contract: body.contract || 'Permanent',
      cv: body.cv || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    await db.collection('staff_records').insertOne(staffRecord)
    
    // Parse certificateImages back to array for response
    const responseRecord = {
      ...staffRecord,
      certificateImages: body.certificateImages || []
    }
    
    return NextResponse.json(responseRecord)
  } catch (error) {
    console.error('Error creating staff record:', error)
    return NextResponse.json({ error: 'Failed to create staff record' }, { status: 500 })
  }
}

// PUT update existing staff record
export async function PUT(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    if (!body.id) {
      return NextResponse.json({ error: 'Staff ID is required for update' }, { status: 400 })
    }
    
    const updateData = {
      fullName: body.fullName,
      mobile: body.mobile,
      address: body.address,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      certificate: body.certificate,
      age: body.age ? parseInt(body.age) : 0,
      education: body.education,
      attendance: body.attendance || 'Present',
      department: body.department,
      bloodType: body.bloodType || '',
      certificateImages: JSON.stringify(body.certificateImages || []),
      notes: body.notes || '',
      pass: body.pass || '',
      contract: body.contract || 'Permanent',
      cv: body.cv || null,
      updated_at: new Date().toISOString()
    }
    
    const result = await db.collection('staff_records').updateOne(
      { id: body.id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }
    
    // Return updated record with parsed fields
    const updatedRecord = await db.collection('staff_records').findOne({ id: body.id })
    
    return NextResponse.json({
      ...updatedRecord,
      certificateImages: body.certificateImages || []
    })
  } catch (error) {
    console.error('Error updating staff record:', error)
    return NextResponse.json({ error: 'Failed to update staff record' }, { status: 500 })
  }
}

// DELETE staff record
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required for deletion' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('staff_records').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Staff record deleted successfully', id })
  } catch (error) {
    console.error('Error deleting staff record:', error)
    return NextResponse.json({ error: 'Failed to delete staff record' }, { status: 500 })
  }
}