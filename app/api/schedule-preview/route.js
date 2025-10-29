import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getTodaysTasks, getTasksForDate } from '@/lib/emailService';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Get schedule preview for multiple days (including historical and future)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days')) || 14; // Default 14 days (1 week back, 1 week forward)
    const historyDays = parseInt(searchParams.get('history')) || 7; // Days in the past to show
    
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    
    const schedule = [];
    const today = new Date();
    
    // Add historical days (past)
    for (let i = historyDays; i > 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const tasksData = await getTasksForDate(db, date);
      
      schedule.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        isToday: false,
        isTomorrow: false,
        isYesterday: i === 1,
        isHistorical: true,
        daysFromToday: -i,
        tasksData
      });
    }
    
    // Add current and future days
    for (let i = 0; i < (days - historyDays); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Get tasks for specific date (consistent for all days)
      const tasksData = await getTasksForDate(db, date);
      
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
        isYesterday: false,
        isHistorical: false,
        daysFromToday: i,
        tasksData
      });
    }
    
    // Sort by date to ensure proper order
    schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return NextResponse.json({
      success: true,
      schedule,
      totalDays: schedule.length,
      historicalDays: historyDays,
      futureDays: days - historyDays
    });
    
  } catch (error) {
    console.error('Error fetching schedule preview:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}