import { NextResponse } from 'next/server';
import { startDailyNotificationScheduler, getSchedulerStatus } from '@/lib/scheduler';

// GET - Get scheduler status
export async function GET() {
  try {
    const status = getSchedulerStatus();
    return NextResponse.json({
      success: true,
      scheduler: status,
      message: status.running ? 'Scheduler is running' : 'Scheduler is not running'
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Start scheduler
export async function POST() {
  try {
    startDailyNotificationScheduler();
    const status = getSchedulerStatus();
    
    return NextResponse.json({
      success: true,
      scheduler: status,
      message: 'Daily notification scheduler started'
    });
  } catch (error) {
    console.error('Error starting scheduler:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}