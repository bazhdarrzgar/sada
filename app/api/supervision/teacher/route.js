import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all teacher supervision records with optional search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    let query = {}
    if (search) {
      query = {
        $or: [
          { teacher_name: { $regex: search, $options: 'i' } },
          { subject: { $regex: search, $options: 'i' } },
          { department: { $regex: search, $options: 'i' } }
        ]
      }
    }
    
    const records = await db.collection('teacher_supervision')
      .find(query)
      .sort({ created_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching teacher supervision records:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher supervision records' }, { status: 500 })
  }
}

// POST create new teacher supervision record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const supervisionRecord = {
      id: uuidv4(),
      teacher_name: body.teacher_name,
      subject: body.subject,
      department: body.department,
      stage: body.stage,
      violation_type: body.violation_type,
      punishment_type: body.punishment_type,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('teacher_supervision').insertOne(supervisionRecord)
    
    // Remove _id before returning
    const { _id, ...result } = supervisionRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating teacher supervision record:', error)
    return NextResponse.json({ error: 'Failed to create teacher supervision record' }, { status: 500 })
  }
}