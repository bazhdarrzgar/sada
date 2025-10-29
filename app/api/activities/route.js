import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all activities
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('activities')
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
    console.error('Error fetching activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

// POST create new activity
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const activityRecord = {
      id: uuidv4(),
      activityType: body.activityType,
      preparationDate: body.preparationDate,
      content: body.content,
      startDate: body.startDate,
      whoDidIt: body.whoDidIt || '',
      helper: body.helper || '',
      activityImages: body.activityImages || [],
      notes: body.notes || '', // تێبینی field
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('activities').insertOne(activityRecord)
    
    // Remove _id for response
    const { _id, ...result } = activityRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
}