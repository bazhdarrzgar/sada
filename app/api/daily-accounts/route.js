import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all daily accounts
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('daily_accounts')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching daily accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch daily accounts' }, { status: 500 })
  }
}

// POST create new daily account
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const accountRecord = {
      id: uuidv4(),
      number: parseInt(body.number) || 0,
      week: body.week,
      purpose: body.purpose,
      checkNumber: body.checkNumber,
      amount: parseFloat(body.amount) || 0,
      date: body.date || '',
      dayOfWeek: body.dayOfWeek || '', // New field for day of week
      receiptImages: body.receiptImages || [], // New field for receipt images
      notes: body.notes || '', // تێبینی field
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('daily_accounts').insertOne(accountRecord)
    
    // Remove _id for response
    const { _id, ...result } = accountRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating daily account:', error)
    return NextResponse.json({ error: 'Failed to create daily account' }, { status: 500 })
  }
}