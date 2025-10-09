import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific exam supervision record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('exam_supervision').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Exam supervision record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching exam supervision record:', error)
    return NextResponse.json({ error: 'Failed to fetch exam supervision record' }, { status: 500 })
  }
}

// PUT update exam supervision record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('exam_supervision').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Exam supervision record not found' }, { status: 404 })
    }
    
    const updateData = {
      subject: body.subject,
      stage: body.stage,
      endTime: body.endTime,
      examAchievement: body.examAchievement,
      supervisorName: body.supervisorName,
      obtainedScore: body.obtainedScore,
      notes: body.notes || '', // تێبینی field
      updated_at: new Date()
    }
    
    await db.collection('exam_supervision').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('exam_supervision').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating exam supervision record:', error)
    return NextResponse.json({ error: 'Failed to update exam supervision record' }, { status: 500 })
  }
}

// DELETE exam supervision record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('exam_supervision').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Exam supervision record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Exam supervision record deleted successfully' })
  } catch (error) {
    console.error('Error deleting exam supervision record:', error)
    return NextResponse.json({ error: 'Failed to delete exam supervision record' }, { status: 500 })
  }
}