import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const students = await db.collection('supervised_students')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = students.map(student => {
      const { _id, ...rest } = student
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching supervised students:', error)
    return NextResponse.json({ error: 'Failed to fetch supervised students' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const newStudent = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('supervised_students').insertOne(newStudent)
    
    // Remove _id for response
    const { _id, ...result } = newStudent
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating supervised student:', error)
    return NextResponse.json({ error: 'Failed to create supervised student' }, { status: 500 })
  }
}