import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific daily account
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('daily_accounts').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Daily account not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching daily account:', error)
    return NextResponse.json({ error: 'Failed to fetch daily account' }, { status: 500 })
  }
}

// PUT update daily account
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('daily_accounts').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Daily account not found' }, { status: 404 })
    }
    
    const updateData = {
      number: parseInt(body.number) || 0,
      week: body.week,
      purpose: body.purpose,
      checkNumber: body.checkNumber,
      amount: parseFloat(body.amount) || 0,
      date: body.date || '',
      dayOfWeek: body.dayOfWeek || '', // Include day of week in updates
      receiptImages: body.receiptImages || [], // Include receipt images in updates
      notes: body.notes || '', // تێبینی field
      updated_at: new Date()
    }
    
    await db.collection('daily_accounts').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('daily_accounts').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating daily account:', error)
    return NextResponse.json({ error: 'Failed to update daily account' }, { status: 500 })
  }
}

// DELETE daily account
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('daily_accounts').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Daily account not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Daily account deleted successfully' })
  } catch (error) {
    console.error('Error deleting daily account:', error)
    return NextResponse.json({ error: 'Failed to delete daily account' }, { status: 500 })
  }
}