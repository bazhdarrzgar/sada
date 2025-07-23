import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific student supervision record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('student_supervision').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Student supervision record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching student supervision record:', error)
    return NextResponse.json({ error: 'Failed to fetch student supervision record' }, { status: 500 })
  }
}

// PUT update student supervision record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('student_supervision').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Student supervision record not found' }, { status: 404 })
    }
    
    const updateData = {
      ...body,
      updated_at: new Date()
    }
    
    await db.collection('student_supervision').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('student_supervision').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating student supervision record:', error)
    return NextResponse.json({ error: 'Failed to update student supervision record' }, { status: 500 })
  }
}

// DELETE student supervision record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('student_supervision').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Student supervision record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Student supervision record deleted successfully' })
  } catch (error) {
    console.error('Error deleting student supervision record:', error)
    return NextResponse.json({ error: 'Failed to delete student supervision record' }, { status: 500 })
  }
}