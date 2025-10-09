import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific teacher info record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('teacher_info')
    
    const record = await collection.findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Teacher info record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching teacher info record:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher info record' }, { status: 500 })
  }
}

// PUT update teacher info record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('teacher_info')
    
    // Check if record exists
    const existing = await collection.findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Teacher info record not found' }, { status: 404 })
    }
    
    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date()
    }
    
    // Remove id from update data to avoid conflicts
    delete updateData.id
    delete updateData._id
    
    // Update the record
    await collection.updateOne(
      { id },
      { $set: updateData }
    )
    
    // Get the updated record
    const updatedRecord = await collection.findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating teacher info record:', error)
    return NextResponse.json({ error: 'Failed to update teacher info record' }, { status: 500 })
  }
}

// DELETE teacher info record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('teacher_info')
    
    const result = await collection.deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Teacher info record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Teacher info record deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher info record:', error)
    return NextResponse.json({ error: 'Failed to delete teacher info record' }, { status: 500 })
  }
}