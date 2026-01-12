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

    // Remove SQLite _id
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
      id: body.id || uuidv4(),
      year: body.year || new Date().getFullYear().toString(),
      month: body.month || '1',
      staffSalary: parseFloat(body.staffSalary) || 0,
      expenses: parseFloat(body.expenses) || 0,
      buildingRent: parseFloat(body.buildingRent) || 0,
      buildingExpenses: parseFloat(body.buildingExpenses) || 0,
      dramaFee: parseFloat(body.dramaFee) || 0,
      socialSupport: parseFloat(body.socialSupport) || 0,
      electricity: parseFloat(body.electricity) || 0,
      books: parseFloat(body.books) || 0,
      clothes: parseFloat(body.clothes) || 0,
      travel: parseFloat(body.travel) || 0,
      transportation: parseFloat(body.transportation) || 0,
      total: parseFloat(body.total) || 0,
      requirement: body.requirement || '', // New field: پێداویستی
      receiptImages: body.receiptImages || [], // New field: وەسڵ
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