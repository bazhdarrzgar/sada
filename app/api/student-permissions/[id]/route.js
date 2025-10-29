import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific student permission
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('student_permissions').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Student permission not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching student permission:', error)
    return NextResponse.json({ error: 'Failed to fetch student permission' }, { status: 500 })
  }
}

// PUT update student permission
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('student_permissions').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Student permission not found' }, { status: 404 })
    }
    
    const updateData = {
      studentName: body.studentName,
      department: body.department,
      stage: body.stage,
      leaveDuration: body.leaveDuration,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason,
      status: body.status,
      notes: body.notes || '',
      supportingVideos: body.supportingVideos || [],
      updated_at: new Date()
    }
    
    await db.collection('student_permissions').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('student_permissions').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating student permission:', error)
    return NextResponse.json({ error: 'Failed to update student permission' }, { status: 500 })
  }
}

// DELETE student permission
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('student_permissions').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Student permission not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Student permission deleted successfully' })
  } catch (error) {
    console.error('Error deleting student permission:', error)
    return NextResponse.json({ error: 'Failed to delete student permission' }, { status: 500 })
  }
} 