import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const leaves = await db.collection('officer_leaves')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = leaves.map(leave => {
      const { _id, ...rest } = leave
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching officer leaves:', error)
    return NextResponse.json({ error: 'Failed to fetch officer leaves' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const newLeave = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('officer_leaves').insertOne(newLeave)
    
    // Remove _id for response
    const { _id, ...result } = newLeave
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating officer leave:', error)
    return NextResponse.json({ error: 'Failed to create officer leave' }, { status: 500 })
  }
}