import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Berdoz Management System API',
    endpoints: {
      calendar: '/api/calendar',
      legend: '/api/legend',
      staff: '/api/staff',


    }
  })
}