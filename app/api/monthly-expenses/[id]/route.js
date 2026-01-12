import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// PUT update monthly expense
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const normalizedId = decodeURIComponent(id).trim()
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')

    const updateData = {
      year: body.year || new Date().getFullYear().toString(),
      month: body.month || '1',
      staffSalary: parseFloat(body.staffSalary) || 0,
      expenses: parseFloat(body.expenses) || 0,
      buildingRent: parseFloat(body.buildingRent) || 0,
      buildingExpenses: parseFloat(body.buildingExpenses) || 0,
      dramaFee: parseFloat(body.dramaFee) || 0,
      socialSupport: parseFloat(body.socialSupport) || 0,
      electricity: parseFloat(body.electricity) || 0,
      books: parseFloat(body.books) || 0,
      clothes: parseFloat(body.clothes) || 0,
      travel: parseFloat(body.travel) || 0,
      transportation: parseFloat(body.transportation) || 0,
      total: parseFloat(body.total) || 0,
      requirement: body.requirement || '', // New field: پێداویستی
      receiptImages: body.receiptImages || [], // New field: وەسڵ
      notes: body.notes || '',
      updated_at: new Date()
    }

    await db.collection('monthly_expenses').updateOne(
      { id: normalizedId },
      { $set: updateData }
    )

    // Fetch the updated record
    const updatedRecord = await db.collection('monthly_expenses').findOne({ id: normalizedId })

    if (!updatedRecord) {
      return NextResponse.json({ error: 'Monthly expense not found' }, { status: 404 })
    }

    // Remove _id for response
    const { _id, ...responseData } = updatedRecord
    return NextResponse.json(responseData)
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

    const result = await db.collection('monthly_expenses').deleteOne({ id: id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Monthly expense not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Monthly expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting monthly expense:', error)
    return NextResponse.json({ error: 'Failed to delete monthly expense' }, { status: 500 })
  }
}