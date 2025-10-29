import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// PUT update building expense
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('building_expenses').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Building expense not found' }, { status: 404 })
    }
    
    const updateData = {
      item: body.item,
      cost: parseFloat(body.cost) || 0,
      year: body.year || new Date().getFullYear().toString(),
      month: body.month || 1,
      date: body.date,
      notes: body.notes || '',
      images: body.images || [],
      updated_at: new Date()
    }
    
    await db.collection('building_expenses').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('building_expenses').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating building expense:', error)
    return NextResponse.json({ error: 'Failed to update building expense' }, { status: 500 })
  }
}

// DELETE building expense
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('building_expenses').deleteOne({ id: id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Building expense not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Building expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting building expense:', error)
    return NextResponse.json({ error: 'Failed to delete building expense' }, { status: 500 })
  }
}