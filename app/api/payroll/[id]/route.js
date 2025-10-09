import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific payroll record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('payroll').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching payroll record:', error)
    return NextResponse.json({ error: 'Failed to fetch payroll record' }, { status: 500 })
  }
}

// PUT update payroll record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('payroll').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }
    
    const updateData = {
      employeeName: body.employeeName,
      salary: parseFloat(body.salary) || 0,
      absence: parseFloat(body.absence) || 0,
      deduction: parseFloat(body.deduction) || 0,
      bonus: parseFloat(body.bonus) || 0,
      total: parseFloat(body.total) || 0,
      month: body.month || '',
      year: body.year || '',
      notes: body.notes || '',
      updated_at: new Date()
    }
    
    await db.collection('payroll').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('payroll').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating payroll record:', error)
    return NextResponse.json({ error: 'Failed to update payroll record' }, { status: 500 })
  }
}

// DELETE payroll record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('payroll').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Payroll record deleted successfully' })
  } catch (error) {
    console.error('Error deleting payroll record:', error)
    return NextResponse.json({ error: 'Failed to delete payroll record' }, { status: 500 })
  }
} 