import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all kitchen expenses
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('kitchen_expenses')
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
    console.error('Error fetching kitchen expenses:', error)
    return NextResponse.json({ error: 'Failed to fetch kitchen expenses' }, { status: 500 })
  }
}

// POST create new kitchen expense
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const expenseRecord = {
      id: uuidv4(),
      item: body.item,
      cost: parseFloat(body.cost) || 0,
      date: body.date || new Date().toISOString().split('T')[0],
      month: body.month || '',
      description: body.description || '',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('kitchen_expenses').insertOne(expenseRecord)
    
    // Remove _id for response
    const { _id, ...result } = expenseRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating kitchen expense:', error)
    return NextResponse.json({ error: 'Failed to create kitchen expense' }, { status: 500 })
  }
}