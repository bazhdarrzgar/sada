import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getTodaysTasks, getTasksForDate } from '@/lib/emailService';

// GET - Get schedule preview for multiple days
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 7; // Default 7 days
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    
    const schedule = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let tasksData;
      if (i === 0) {
        // Use existing function for today
        tasksData = await getTodaysTasks(db);
      } else {
        // Get tasks for specific date
        tasksData = await getTasksForDate(db, date);
      }
      
      schedule.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        isToday: i === 0,
        isTomorrow: i === 1,
        tasksData
      });
    }
    
    return NextResponse.json({
      success: true,
      schedule
    });
    
  } catch (error) {
    console.error('Error fetching schedule preview:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}