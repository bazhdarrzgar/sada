import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getTodaysTasks, getTasksForDate } from '@/lib/emailService'

// GET email preview for a specific date
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get('date')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    let tasksData
    if (dateParam) {
      // Get tasks for specific date
      const targetDate = new Date(dateParam)
      tasksData = await getTasksForDate(db, targetDate)
    } else {
      // Get today's tasks
      tasksData = await getTodaysTasks(db)
    }
    
    return NextResponse.json({
      success: true,
      tasksData,
      preview: true,
      message: tasksData.hasTasksToday 
        ? `Found ${tasksData.codes.length} task codes for ${tasksData.date}` 
        : `No tasks scheduled for ${tasksData.date}`
    })
    
  } catch (error) {
    console.error('Error generating email preview:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate email preview',
      details: error.message 
    }, { status: 500 })
  }
}

// POST send email for specific date
export async function POST(request) {
  try {
    const body = await request.json()
    const { date, targetEmail } = body
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    let tasksData
    if (date) {
      const targetDate = new Date(date)
      tasksData = await getTasksForDate(db, targetDate)
    } else {
      tasksData = await getTodaysTasks(db)
    }
    
    if (!tasksData.hasTasksToday) {
      return NextResponse.json({
        success: true,
        message: 'No tasks to send for the specified date',
        tasksData
      })
    }
    
    // Import sendDailyTaskNotification dynamically to avoid circular imports
    const { sendDailyTaskNotification } = await import('@/lib/emailService')
    
    const emailResult = await sendDailyTaskNotification(tasksData, targetEmail)
    
    return NextResponse.json({
      success: true,
      tasksData,
      emailResult,
      message: emailResult.success 
        ? `Email sent successfully with ${tasksData.codes.length} task codes`
        : `Failed to send email: ${emailResult.error}`
    })
    
  } catch (error) {
    console.error('Error sending calendar email:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send calendar email',
      details: error.message 
    }, { status: 500 })
  }
}