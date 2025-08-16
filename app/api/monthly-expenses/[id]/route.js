import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific monthly expense
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('monthly_expenses').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Monthly expense not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching monthly expense:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly expense' }, { status: 500 })
  }
}

// PUT update monthly expense
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('monthly_expenses').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Monthly expense not found' }, { status: 404 })
    }
    
    const updateData = {
      year: body.year,
      month: body.month,
      staffSalary: parseFloat(body.staffSalary) || 0,
      expenses: parseFloat(body.expenses) || 0,
      buildingRent: parseFloat(body.buildingRent) || 0,
      dramaFee: parseFloat(body.dramaFee) || 0,
      socialSupport: parseFloat(body.socialSupport) || 0,
      electricity: parseFloat(body.electricity) || 0,
      total: parseFloat(body.total) || 0,
      notes: body.notes || '',
      updated_at: new Date()
    }
    
    await db.collection('monthly_expenses').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('monthly_expenses').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating monthly expense:', error)
    return NextResponse.json({ error: 'Failed to update monthly expense' }, { status: 500 })
  }
}

// DELETE monthly expense
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('monthly_expenses').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Monthly expense not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Monthly expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting monthly expense:', error)
    return NextResponse.json({ error: 'Failed to delete monthly expense' }, { status: 500 })
  }
} 