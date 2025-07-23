import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all payroll records with optional search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    let query = {}
    if (search) {
      query = {
        employee_name: { $regex: search, $options: 'i' }
      }
    }
    
    const records = await db.collection('payroll_records')
      .find(query)
      .sort({ created_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching payroll records:', error)
    return NextResponse.json({ error: 'Failed to fetch payroll records' }, { status: 500 })
  }
}

// POST create new payroll record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Calculate total automatically
    const salary = parseFloat(body.salary) || 0
    const absence = parseFloat(body.absence) || 0
    const deduction = parseFloat(body.deduction) || 0
    const bonus = parseFloat(body.bonus) || 0
    const total = salary - absence - deduction + bonus
    
    const payrollRecord = {
      id: uuidv4(),
      employee_name: body.employee_name,
      salary: salary,
      absence: absence,
      deduction: deduction,
      bonus: bonus,
      total: total,
      notes: body.notes || '',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('payroll_records').insertOne(payrollRecord)
    
    // Remove _id before returning
    const { _id, ...result } = payrollRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating payroll record:', error)
    return NextResponse.json({ error: 'Failed to create payroll record' }, { status: 500 })
  }
}