import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific staff record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('staff_records').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }
    
    // Parse certificateImages from JSON string to array
    let certificateImages = []
    
    if (record.certificateImages) {
      if (Array.isArray(record.certificateImages)) {
        certificateImages = record.certificateImages
      } else if (typeof record.certificateImages === 'string') {
        try {
          const parsed = JSON.parse(record.certificateImages)
          certificateImages = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          // Parsing failed, use empty array
          certificateImages = []
        }
      }
    }
    
    return NextResponse.json({
      ...record,
      certificateImages
    })
  } catch (error) {
    console.error('Error fetching staff record:', error)
    return NextResponse.json({ error: 'Failed to fetch staff record' }, { status: 500 })
  }
}

// PUT update staff record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('staff_records').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }
    
    const updateData = {
      fullName: body.fullName || existing.fullName,
      mobile: body.mobile || existing.mobile,
      address: body.address || existing.address,
      gender: body.gender || existing.gender,
      dateOfBirth: body.dateOfBirth || existing.dateOfBirth,
      certificate: body.certificate || existing.certificate,
      age: body.age ? parseInt(body.age) : existing.age,
      education: body.education || existing.education,
      attendance: body.attendance || existing.attendance,
      date: body.date || existing.date,
      department: body.department || existing.department,
      bloodType: body.bloodType || existing.bloodType,
      notes: body.notes || existing.notes,
      pass: body.pass || existing.pass,
      contract: body.contract || existing.contract,
      updated_at: new Date().toISOString()
    }
    
    // Keep certificateImages and cv if they exist
    if (body.certificateImages) {
      updateData.certificateImages = JSON.stringify(body.certificateImages)
    } else if (existing.certificateImages) {
      updateData.certificateImages = existing.certificateImages
    }
    
    if (body.cv) {
      updateData.cv = body.cv
    } else if (existing.cv) {
      updateData.cv = existing.cv
    }
    
    await db.collection('staff_records').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('staff_records').findOne({ id })
    
    // Return with parsed certificateImages
    return NextResponse.json({
      ...updatedRecord,
      certificateImages: body.certificateImages || (existing.certificateImages ? JSON.parse(existing.certificateImages) : [])
    })
  } catch (error) {
    console.error('Error updating staff record:', error)
    return NextResponse.json({ error: 'Failed to update staff record' }, { status: 500 })
  }
}

// DELETE staff record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('staff_records').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Staff record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Staff record deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff record:', error)
    return NextResponse.json({ error: 'Failed to delete staff record' }, { status: 500 })
  }
}