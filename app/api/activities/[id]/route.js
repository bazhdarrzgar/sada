import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific activity
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('activities').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching activity:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}

// PUT update activity
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('activities').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }
    
    const updateData = {
      activityType: body.activityType,
      preparationDate: body.preparationDate,
      content: body.content,
      startDate: body.startDate,
      whoDidIt: body.whoDidIt || '',
      helper: body.helper || '',
      activityImages: body.activityImages || [],
      notes: body.notes || '', // تێبینی field
      updated_at: new Date()
    }
    
    await db.collection('activities').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('activities').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating activity:', error)
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 })
  }
}

// DELETE activity
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('activities').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Activity deleted successfully' })
  } catch (error) {
    console.error('Error deleting activity:', error)
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 })
  }
}