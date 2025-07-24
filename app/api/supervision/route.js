import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for demo (in production, this would be a database)
let supervisionData = []

export async function GET() {
  try {
    return NextResponse.json(supervisionData)
  } catch (error) {
    console.error('Error fetching supervision data:', error)
    return NextResponse.json({ error: 'Failed to fetch supervision data' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    const newSupervision = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    supervisionData.push(newSupervision)
    
    return NextResponse.json(newSupervision, { status: 201 })
  } catch (error) {
    console.error('Error creating supervision entry:', error)
    return NextResponse.json({ error: 'Failed to create supervision entry' }, { status: 500 })
  }
}