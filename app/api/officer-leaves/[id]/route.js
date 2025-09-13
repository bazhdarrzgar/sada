import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const updateData = {
      ...data,
      updated_at: new Date()
    }
    
    const result = await db.collection('officer_leaves').updateOne(
      { id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 })
    }
    
    const updatedRecord = await db.collection('officer_leaves').findOne({ id })
    const { _id, ...rest } = updatedRecord
    return NextResponse.json(rest)
  } catch (error) {
    console.error('Error updating leave record:', error)
    return NextResponse.json({ error: 'Failed to update leave record' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('officer_leaves').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Leave record deleted successfully' })
  } catch (error) {
    console.error('Error deleting leave record:', error)
    return NextResponse.json({ error: 'Failed to delete leave record' }, { status: 500 })
  }
}