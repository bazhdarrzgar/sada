import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific legend entry
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const entry = await db.collection('legend_entries').findOne({ id })
    
    if (!entry) {
      return NextResponse.json({ error: 'Legend entry not found' }, { status: 404 })
    }
    
    const { _id, ...result } = entry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching legend entry:', error)
    return NextResponse.json({ error: 'Failed to fetch legend entry' }, { status: 500 })
  }
}

// PUT update legend entry
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('legend_entries').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Legend entry not found' }, { status: 404 })
    }
    
    const updateData = {
      ...body,
      updated_at: new Date()
    }
    
    if (updateData.abbreviation) {
      updateData.abbreviation = updateData.abbreviation.toUpperCase()
    }
    
    await db.collection('legend_entries').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedEntry = await db.collection('legend_entries').findOne({ id })
    const { _id, ...result } = updatedEntry
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating legend entry:', error)
    return NextResponse.json({ error: 'Failed to update legend entry' }, { status: 500 })
  }
}

// DELETE legend entry
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('legend_entries').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Legend entry not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Legend entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting legend entry:', error)
    return NextResponse.json({ error: 'Failed to delete legend entry' }, { status: 500 })
  }
}