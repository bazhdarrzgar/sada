import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific teacher supervision record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('teacher_supervision').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Teacher supervision record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching teacher supervision record:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher supervision record' }, { status: 500 })
  }
}

// PUT update teacher supervision record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('teacher_supervision').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Teacher supervision record not found' }, { status: 404 })
    }
    
    const updateData = {
      ...body,
      updated_at: new Date()
    }
    
    await db.collection('teacher_supervision').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('teacher_supervision').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating teacher supervision record:', error)
    return NextResponse.json({ error: 'Failed to update teacher supervision record' }, { status: 500 })
  }
}

// DELETE teacher supervision record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('teacher_supervision').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Teacher supervision record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Teacher supervision record deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher supervision record:', error)
    return NextResponse.json({ error: 'Failed to delete teacher supervision record' }, { status: 500 })
  }
}