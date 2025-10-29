import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific supervised student
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('supervised_students').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Supervised student not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching supervised student:', error)
    return NextResponse.json({ error: 'Failed to fetch supervised student' }, { status: 500 })
  }
}

// PUT update supervised student
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('supervised_students').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Supervised student not found' }, { status: 404 })
    }
    
    const updateData = {
      studentName: body.studentName,
      department: body.department,
      grade: body.grade,
      subject: body.subject,
      violationType: body.violationType,
      list: body.list,
      punishmentType: body.punishmentType,
      guardianNotification: body.guardianNotification,
      guardianPhone: body.guardianPhone,
      notes: body.notes || '',
      updated_at: new Date()
    }
    
    await db.collection('supervised_students').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('supervised_students').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating supervised student:', error)
    return NextResponse.json({ error: 'Failed to update supervised student' }, { status: 500 })
  }
}

// DELETE supervised student
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('supervised_students').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Supervised student not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Supervised student deleted successfully' })
  } catch (error) {
    console.error('Error deleting supervised student:', error)
    return NextResponse.json({ error: 'Failed to delete supervised student' }, { status: 500 })
  }
}