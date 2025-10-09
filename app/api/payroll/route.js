import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all payroll records
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('payroll')
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
    console.error('Error fetching payroll:', error)
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 })
  }
}

// POST create new payroll record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const payrollRecord = {
      id: uuidv4(),
      employeeName: body.employeeName,
      salary: parseFloat(body.salary) || 0,
      absence: parseFloat(body.absence) || 0,
      deduction: parseFloat(body.deduction) || 0,
      bonus: parseFloat(body.bonus) || 0,
      total: parseFloat(body.total) || 0,
      month: body.month || '',
      year: body.year || '',
      notes: body.notes || '',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('payroll').insertOne(payrollRecord)
    
    // Remove _id for response
    const { _id, ...result } = payrollRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating payroll record:', error)
    return NextResponse.json({ error: 'Failed to create payroll record' }, { status: 500 })
  }
}