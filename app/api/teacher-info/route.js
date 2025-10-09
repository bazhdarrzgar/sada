import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('teacher_info')
    
    // Try to get data from database sorted by updated_at
    const teacherInfo = await collection
      .find({})
      .sort({ updated_at: -1 })
      .toArray()
    
    // Remove SQLite _id
    const result = teacherInfo.map(item => {
      const { _id, ...rest } = item
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher info' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Generate ID if not provided
    if (!data.id) {
      data.id = uuidv4()
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('teacher_info')
    
    const newData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await collection.insertOne(newData)
    
    // Remove _id for response
    const { _id, ...result } = newData
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher info:', error)
    return NextResponse.json({ error: 'Failed to create teacher info' }, { status: 500 })
  }
}

