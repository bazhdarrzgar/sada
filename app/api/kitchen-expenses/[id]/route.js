import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// PUT update kitchen expense
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Auto-extract year from date if provided, otherwise keep existing or use provided
    let year = body.year
    if (body.date) {
      year = new Date(body.date).getFullYear().toString()
    }
    
    const updateData = {
      item: body.item,
      cost: parseFloat(body.cost) || 0,
      date: body.date,
      month: body.month,
      year: year, // New field: ساڵ
      purpose: body.purpose,
      receiptImages: body.receiptImages || [], // New field: وەسڵ
      notes: body.notes || '',
      updated_at: new Date()
    }
    
    const result = await db.collection('kitchen_expenses').findOneAndUpdate(
      { id: id },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    
    if (!result.value) {
      return NextResponse.json({ error: 'Kitchen expense not found' }, { status: 404 })
    }
    
    // Remove _id for response
    const { _id, ...response } = result.value
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating kitchen expense:', error)
    return NextResponse.json({ error: 'Failed to update kitchen expense' }, { status: 500 })
  }
}

// DELETE kitchen expense
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('kitchen_expenses').deleteOne({ id: id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Kitchen expense not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Kitchen expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting kitchen expense:', error)
    return NextResponse.json({ error: 'Failed to delete kitchen expense' }, { status: 500 })
  }
}