import { NextResponse } from 'next/server';

// GET - Get current system time in various timezones
export async function GET() {
  try {
    const now = new Date();
    
    return NextResponse.json({
      success: true,
      time: {
        utc: now.toISOString(),
        baghdad: new Date(now.getTime() + (3 * 60 * 60 * 1000)).toISOString(),
        local: now.toLocaleString(),
        timestamp: now.getTime(),
        timezones: {
          'UTC': now.toISOString(),
          'Asia/Baghdad': new Date(now.getTime() + (3 * 60 * 60 * 1000)).toISOString(),
          'America/New_York': new Date(now.getTime() - (5 * 60 * 60 * 1000)).toISOString(),
          'Europe/London': new Date(now.getTime() + (0 * 60 * 60 * 1000)).toISOString()
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting system time:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}