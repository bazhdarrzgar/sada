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
    
    const { _id, pass, ...rest } = record
    return NextResponse.json({
      ...rest,
      pass_grade: pass || ''
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
      ...body,
      updated_at: new Date()
    }
    
    // Convert pass_grade to pass for storage
    if (updateData.pass_grade) {
      updateData.pass = updateData.pass_grade
      delete updateData.pass_grade
    }
    
    if (updateData.age) {
      updateData.age = parseInt(updateData.age)
    }
    
    await db.collection('staff_records').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('staff_records').findOne({ id })
    const { _id, pass, ...result } = updatedRecord
    return NextResponse.json({
      ...result,
      pass_grade: pass || ''
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