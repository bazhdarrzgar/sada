import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// PUT update building expense
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const updateData = {
      item: body.item,
      cost: parseFloat(body.cost) || 0,
      month: body.month,
      updated_at: new Date()
    }
    
    const result = await db.collection('building_expenses').findOneAndUpdate(
      { id: id },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result.value) {
      return NextResponse.json({ error: 'Building expense not found' }, { status: 404 })
    }
    
    // Remove _id for response
    const { _id, ...responseData } = result.value
    return NextResponse.json(responseData)
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