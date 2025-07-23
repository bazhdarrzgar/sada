import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific payroll record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('payroll_records').findOne({ id })
    
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
    
    const existing = await db.collection('payroll_records').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }
    
    const updateData = { ...body }
    
    // Recalculate total with merged values
    const salary = parseFloat(updateData.salary || existing.salary || 0)
    const absence = parseFloat(updateData.absence || existing.absence || 0)
    const deduction = parseFloat(updateData.deduction || existing.deduction || 0)
    const bonus = parseFloat(updateData.bonus || existing.bonus || 0)
    const total = salary - absence - deduction + bonus
    
    updateData.salary = salary
    updateData.absence = absence
    updateData.deduction = deduction
    updateData.bonus = bonus
    updateData.total = total
    updateData.updated_at = new Date()
    
    await db.collection('payroll_records').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('payroll_records').findOne({ id })
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
    
    const result = await db.collection('payroll_records').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Payroll record deleted successfully' })
  } catch (error) {
    console.error('Error deleting payroll record:', error)
    return NextResponse.json({ error: 'Failed to delete payroll record' }, { status: 500 })
  }
}