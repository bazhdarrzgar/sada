import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const supervisionData = await db.collection('supervision')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = supervisionData.map(item => {
      const { _id, ...rest } = item
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching supervision data:', error)
    return NextResponse.json({ error: 'Failed to fetch supervision data' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const newSupervision = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('supervision').insertOne(newSupervision)
    
    // Remove _id for response
    const { _id, ...result } = newSupervision
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating supervision entry:', error)
    return NextResponse.json({ error: 'Failed to create supervision entry' }, { status: 500 })
  }
}