import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific installment
export async function GET(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const record = await db.collection('installments').findOne({ id })
    
    if (!record) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 })
    }
    
    const { _id, ...result } = record
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching installment:', error)
    return NextResponse.json({ error: 'Failed to fetch installment' }, { status: 500 })
  }
}

// PUT update installment
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const existing = await db.collection('installments').findOne({ id })
    if (!existing) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 })
    }
    
    const updateData = {
      fullName: body.fullName,
      grade: body.grade,
      installmentType: body.installmentType,
      annualAmount: parseFloat(body.annualAmount) || 0,
      firstInstallment: parseFloat(body.firstInstallment) || 0,
      secondInstallment: parseFloat(body.secondInstallment) || 0,
      thirdInstallment: parseFloat(body.thirdInstallment) || 0,
      fourthInstallment: parseFloat(body.fourthInstallment) || 0,
      fifthInstallment: parseFloat(body.fifthInstallment) || 0,
      sixthInstallment: parseFloat(body.sixthInstallment) || 0,
      totalReceived: parseFloat(body.totalReceived) || 0,
      remaining: parseFloat(body.remaining) || 0,
      receiptImages: body.receiptImages || [], // Receipt images field
      notes: body.notes || '',
      updated_at: new Date()
    }
    
    await db.collection('installments').updateOne(
      { id },
      { $set: updateData }
    )
    
    const updatedRecord = await db.collection('installments').findOne({ id })
    const { _id, ...result } = updatedRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating installment:', error)
    return NextResponse.json({ error: 'Failed to update installment' }, { status: 500 })
  }
}

// DELETE installment
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('installments').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Installment deleted successfully' })
  } catch (error) {
    console.error('Error deleting installment:', error)
    return NextResponse.json({ error: 'Failed to delete installment' }, { status: 500 })
  }
}