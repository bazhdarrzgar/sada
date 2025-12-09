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
    
    // Map database column names to frontend expected field names
    const result = records.map(record => {
      return {
        id: record.id,
        full_name: record.fullName || '',
        mobile: record.mobile || '',
        residence: record.address || '',
        gender: record.gender || '',
        id_number: record.id_number || '',
        certificate: record.certificate || '',
        age: record.age || '',
        school: record.education || '',
        preparatory: record.preparatory || '',
        date: record.date || '',
        department: record.department || '',
        pass: record.pass || '',
        contract: record.contract || ''
      }
    })
    
    return NextResponse.json(result)
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
      fullName: body.full_name || body.fullName || '',
      mobile: body.mobile || '',
      address: body.residence || body.address || '',
      gender: body.gender || '',
      dateOfBirth: body.dateOfBirth || '',
      certificate: body.certificate || '',
      age: body.age ? parseInt(body.age) : 0,
      education: body.school || body.education || '',
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
    
    // Return with frontend expected field names
    return NextResponse.json({
      id: staffRecord.id,
      full_name: staffRecord.fullName,
      mobile: staffRecord.mobile,
      residence: staffRecord.address,
      gender: staffRecord.gender,
      id_number: staffRecord.id_number || '',
      certificate: staffRecord.certificate,
      age: staffRecord.age,
      school: staffRecord.education,
      preparatory: staffRecord.preparatory || '',
      date: staffRecord.date,
      department: staffRecord.department,
      pass: staffRecord.pass,
      contract: staffRecord.contract
    })
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
      age: parseInt(body.age),
      education: body.education,
      attendance: body.attendance || 'Present',
      department: body.department,
      bloodType: body.bloodType || '',
      certificateImages: body.certificateImages || [],
      notes: body.notes || '',
      pass: body.pass_grade || body.pass || '',
      contract: body.contract || 'Permanent',
      cv: body.cv || null,
      updated_at: new Date()
    }
    
    const result = await db.collection('staff_records').updateOne(
      { id: body.id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }
    
    // Return updated record
    const updatedRecord = await db.collection('staff_records').findOne({ id: body.id })
    const { _id, pass, ...responseData } = updatedRecord
    
    return NextResponse.json({
      ...responseData,
      pass_grade: pass
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