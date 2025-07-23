import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// Helper function to extract abbreviations from text and update legend
async function updateLegend(db, entries) {
  const allText = entries.join(' ')
  const abbreviations = allText.match(/[A-Z][A-Z0-9]*/g) || []
  
  for (const abbr of abbreviations) {
    if (abbr.length >= 1) {
      const existing = await db.collection('legend_entries').findOne({ abbreviation: abbr })
      
      if (existing) {
        // Update usage count
        await db.collection('legend_entries').updateOne(
          { abbreviation: abbr },
          {
            $inc: { usage_count: 1 },
            $set: { last_used: new Date() }
          }
        )
      } else {
        // Create new legend entry
        const legendEntry = {
          id: uuidv4(),
          abbreviation: abbr,
          full_description: `${abbr} - Please update description`,
          category: 'General',
          usage_count: 1,
          last_used: new Date(),
          created_at: new Date()
        }
        await db.collection('legend_entries').insertOne(legendEntry)
      }
    }
  }
}

// GET all calendar entries
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const entries = await db.collection('calendar_entries')
      .find({})
      .sort({ created_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id and return
    const result = entries.map(entry => {
      const { _id, ...rest } = entry
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching calendar entries:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar entries' }, { status: 500 })
  }
}

// POST create new calendar entry
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const calendarEntry = {
      id: uuidv4(),
      month: body.month,
      week1: body.week1 || ['', '', '', '', ''],
      week2: body.week2 || ['', '', '', '', ''],
      week3: body.week3 || ['', '', '', '', ''],
      week4: body.week4 || ['', '', '', '', ''],
      year: body.year || new Date().getFullYear(),
      created_at: new Date(),
      updated_at: new Date()
    }
    
    // Extract all entries for legend update
    const allEntries = [
      ...calendarEntry.week1,
      ...calendarEntry.week2,
      ...calendarEntry.week3,
      ...calendarEntry.week4
    ]
    await updateLegend(db, allEntries)
    
    await db.collection('calendar_entries').insertOne(calendarEntry)
    
    // Remove _id before returning
    const { _id, ...result } = calendarEntry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating calendar entry:', error)
    return NextResponse.json({ error: 'Failed to create calendar entry' }, { status: 500 })
  }
}