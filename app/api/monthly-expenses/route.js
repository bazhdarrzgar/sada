import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all monthly expenses
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('monthly_expenses')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching monthly expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly expenses' }, { status: 500 })
  }
}

// POST create new monthly expense
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const expenseRecord = {
      id: uuidv4(),
      month: body.month,
      salaries: parseFloat(body.salaries) || 0,
      rent: parseFloat(body.rent) || 0,
      utilities: parseFloat(body.utilities) || 0,
      maintenance: parseFloat(body.maintenance) || 0,
      supplies: parseFloat(body.supplies) || 0,
      other: parseFloat(body.other) || 0,
      total: parseFloat(body.total) || 0,
      notes: body.notes || '',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('monthly_expenses').insertOne(expenseRecord)
    
    // Remove _id for response
    const { _id, ...result } = expenseRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating monthly expense:', error)
    return NextResponse.json({ error: 'Failed to create monthly expense' }, { status: 500 })
  }
}