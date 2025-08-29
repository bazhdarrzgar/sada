import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific supervision record
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('supervision').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Supervision record not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching supervision record:', error)
    return NextResponse.json({ error: 'Failed to fetch supervision record' }, { status: 500 })
  }
}

// PUT update supervision record
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('supervision').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Supervision record not found' }, { status: 404 })
    }
    
    const updateData = {
      ...body,
      notes: body.notes || '',
      updated_at: new Date()
    }
    
    await db.collection('supervision').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('supervision').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating supervision record:', error)
    return NextResponse.json({ error: 'Failed to update supervision record' }, { status: 500 })
  }
}

// DELETE supervision record
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('supervision').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Supervision record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Supervision record deleted successfully' })
  } catch (error) {
    console.error('Error deleting supervision record:', error)
    return NextResponse.json({ error: 'Failed to delete supervision record' }, { status: 500 })
  }
}