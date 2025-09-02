import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

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
        const { v4: uuidv4 } = await import('uuid')
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

// GET specific calendar entry
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const entry = await db.collection('calendar_entries').findOne({ id })
    
    if (!entry) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 })
    }
    
    const { _id, ...result } = entry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching calendar entry:', error)
    return NextResponse.json({ error: 'Failed to fetch calendar entry' }, { status: 500 })
  }
}

// PUT update calendar entry
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('calendar_entries').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 })
    }
    
    const updateData = {
      ...body,
      updated_at: new Date()
    }
    
    // If weeks are being updated, update legend
    const hasWeekUpdates = ['week1', 'week2', 'week3', 'week4'].some(week => body[week])
    if (hasWeekUpdates) {
      const weeks = [
        body.week1 || existing.week1 || [],
        body.week2 || existing.week2 || [],
        body.week3 || existing.week3 || [],
        body.week4 || existing.week4 || []
      ]
      const allEntries = weeks.flat()
      await updateLegend(db, allEntries)
    }
    
    await db.collection('calendar_entries').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedEntry = await db.collection('calendar_entries').findOne({ id })
    const { _id, ...result } = updatedEntry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating calendar entry:', error)
    return NextResponse.json({ error: 'Failed to update calendar entry' }, { status: 500 })
  }
}

// DELETE calendar entry
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('calendar_entries').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Calendar entry not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Calendar entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting calendar entry:', error)
    return NextResponse.json({ error: 'Failed to delete calendar entry' }, { status: 500 })
  }
}