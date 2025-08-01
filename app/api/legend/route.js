import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all legend entries
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const entries = await db.collection('legend_entries')
      .find({})
      .sort([['usage_count', -1], ['abbreviation', 1]])
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id and return
    const result = entries.map(entry => {
      const { _id, ...rest } = entry
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching legend entries:', error)
    return NextResponse.json({ error: 'Failed to fetch legend entries' }, { status: 500 })
  }
}

// POST create new legend entry
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const legendEntry = {
      id: uuidv4(),
      abbreviation: body.abbreviation.toUpperCase(),
      full_description: body.full_description,
      category: body.category || 'General',
      usage_count: 1,
      last_used: new Date(),
      created_at: new Date()
    }
    
    await db.collection('legend_entries').insertOne(legendEntry)
    
    // Remove _id before returning
    const { _id, ...result } = legendEntry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating legend entry:', error)
    return NextResponse.json({ error: 'Failed to create legend entry' }, { status: 500 })
  }
}