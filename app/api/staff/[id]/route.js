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
    
    // Return with frontend expected field names
    return NextResponse.json({
      id: record.id,
      full_name: record.fullName,
      mobile: record.mobile,
      residence: record.address,
      gender: record.gender,
      id_number: record.id_number || '',
      certificate: record.certificate,
      age: record.age,
      school: record.education,
      preparatory: record.preparatory || '',
      date: record.date,
      department: record.department,
      pass: record.pass,
      contract: record.contract
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
    
    // Map frontend field names to database column names
    const updateData = {
      fullName: body.full_name || body.fullName || existing.fullName,
      mobile: body.mobile || existing.mobile,
      address: body.residence || body.address || existing.address,
      gender: body.gender || existing.gender,
      dateOfBirth: body.dateOfBirth || existing.dateOfBirth,
      certificate: body.certificate || existing.certificate,
      age: body.age ? parseInt(body.age) : existing.age,
      education: body.school || body.education || existing.education,
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
    }
    if (body.cv) {
      updateData.cv = body.cv
    }
    
    await db.collection('staff_records').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('staff_records').findOne({ id })
    
    // Return with frontend expected field names
    return NextResponse.json({
      id: updatedRecord.id,
      full_name: updatedRecord.fullName,
      mobile: updatedRecord.mobile,
      residence: updatedRecord.address,
      gender: updatedRecord.gender,
      id_number: updatedRecord.id_number || '',
      certificate: updatedRecord.certificate,
      age: updatedRecord.age,
      school: updatedRecord.education,
      preparatory: updatedRecord.preparatory || '',
      date: updatedRecord.date,
      department: updatedRecord.department,
      pass: updatedRecord.pass,
      contract: updatedRecord.contract
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