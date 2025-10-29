import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getTodaysTasks, sendDailyTaskNotification, testEmailConfiguration } from '@/lib/emailService';

// GET - Check today's tasks and optionally send notification
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sendEmail = searchParams.get('send') === 'true';
    const test = searchParams.get('test') === 'true';
    
    // Test email configuration
    if (test) {
      const testResult = await testEmailConfiguration();
      return NextResponse.json(testResult);
    }
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    
    // Get today's tasks
    const tasksData = await getTodaysTasks(db);
    
    let emailResult = null;
    
    // Send email if requested and there are tasks
    if (sendEmail && tasksData.hasTasksToday) {
      emailResult = await sendDailyTaskNotification(tasksData);
    }
    
    return NextResponse.json({
      success: true,
      tasksData,
      emailResult,
      message: tasksData.hasTasksToday 
        ? `Found ${tasksData.codes.length} task codes for today`
        : 'No tasks scheduled for today'
    });
    
  } catch (error) {
    console.error('Error in daily notifications API:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Manually trigger notification
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    
    // Get today's tasks
    const tasksData = await getTodaysTasks(db);
    
    // Send notification
    const emailResult = await sendDailyTaskNotification(tasksData);
    
    return NextResponse.json({
      success: true,
      tasksData,
      emailResult,
      message: 'Manual notification triggered'
    });
    
  } catch (error) {
    console.error('Error triggering manual notification:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}