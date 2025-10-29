import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all installments
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('installments')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching installments:', error)
    return NextResponse.json({ error: 'Failed to fetch installments' }, { status: 500 })
  }
}

// POST create new installment
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const installmentRecord = {
      id: uuidv4(),
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
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('installments').insertOne(installmentRecord)
    
    // Remove _id for response
    const { _id, ...result } = installmentRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating installment:', error)
    return NextResponse.json({ error: 'Failed to create installment' }, { status: 500 })
  }
}