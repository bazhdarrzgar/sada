import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all exam supervision records
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('exam_supervision')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching exam supervision:', error)
    return NextResponse.json({ error: 'Failed to fetch exam supervision' }, { status: 500 })
  }
}

// POST create new exam supervision record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const examRecord = {
      id: uuidv4(),
      subject: body.subject,
      stage: body.stage,
      endTime: body.endTime,
      examAchievement: body.examAchievement,
      supervisorName: body.supervisorName,
      obtainedScore: body.obtainedScore,
      notes: body.notes || '', // تێبینی field
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('exam_supervision').insertOne(examRecord)
    
    // Remove _id for response
    const { _id, ...result } = examRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating exam supervision record:', error)
    return NextResponse.json({ error: 'Failed to create exam supervision record' }, { status: 500 })
  }
}