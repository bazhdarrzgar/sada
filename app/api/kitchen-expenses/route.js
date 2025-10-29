import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all kitchen expenses
export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    
    // Build filter query
    let filterQuery = {}
    if (year && year !== 'ALL_YEARS') {
      filterQuery.year = year
    }
    if (month && month !== 'ALL_MONTHS') {
      filterQuery.month = month
    }
    
    const records = await db.collection('kitchen_expenses')
      .find(filterQuery)
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
    
    // Auto-extract year from date if provided, otherwise use current year
    let year = body.year || new Date().getFullYear().toString()
    if (body.date) {
      year = new Date(body.date).getFullYear().toString()
    }
    
    const expenseRecord = {
      id: uuidv4(),
      item: body.item,
      cost: parseFloat(body.cost) || 0,
      date: body.date || new Date().toISOString().split('T')[0],
      month: body.month || '',
      year: year, // New field: ساڵ
      purpose: body.purpose || '',
      receiptImages: body.receiptImages || [], // New field: وەسڵ
      notes: body.notes || '',
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