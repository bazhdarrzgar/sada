import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all email tasks or tasks for a specific date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const upcoming = searchParams.get('upcoming') === 'true'
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    let query = {}
    
    if (date) {
      // Get tasks for specific date
      const targetDate = new Date(date)
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))
      
      query = {
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    } else if (upcoming) {
      // Get upcoming tasks (next 7 days)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000))
      
      query = {
        date: {
          $gte: today,
          $lte: nextWeek
        }
      }
    }
    
    const tasks = await db.collection('email_tasks')
      .find(query)
      .sort({ date: 1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id and return
    const result = tasks.map(task => {
      const { _id, ...rest } = task
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching email tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch email tasks' }, { status: 500 })
  }
}

// POST create new email task
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const emailTask = {
      id: uuidv4(),
      calendarEntryId: body.calendarEntryId || null,
      date: new Date(body.date),
      codes: body.codes || [],
      description: body.description || '',
      monthContext: body.monthContext || '',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('email_tasks').insertOne(emailTask)
    
    // Update legend usage for the codes
    for (const code of emailTask.codes) {
      await db.collection('legend_entries').updateOne(
        { abbreviation: code },
        {
          $inc: { usage_count: 1 },
          $set: { last_used: new Date() }
        }
      )
    }
    
    // Remove _id before returning
    const { _id, ...result } = emailTask
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating email task:', error)
    return NextResponse.json({ error: 'Failed to create email task' }, { status: 500 })
  }
}

// DELETE email task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    
    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('email_tasks').deleteOne({ id: taskId })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting email task:', error)
    return NextResponse.json({ error: 'Failed to delete email task' }, { status: 500 })
  }
}