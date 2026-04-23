import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all personal installment requests
export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db(process.env.DB_NAME || 'berdoz_management')

        const records = await db.collection('personal_installments')
            .find({})
            .sort({ updated_at: -1 })
            .limit(1000)
            .toArray()

        const result = records.map(record => {
            const { _id, ...rest } = record
            return rest
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching personal installments:', error)
        return NextResponse.json({ error: 'Failed to fetch personal installments' }, { status: 500 })
    }
}

// POST create new personal installment request
export async function POST(request) {
    try {
        const body = await request.json()
        const client = await clientPromise
        const db = client.db(process.env.DB_NAME || 'berdoz_management')

        const record = {
            id: uuidv4(),
            code: body.code || '',
            studentName: body.studentName || '',
            department: body.department || '',
            studyYear: body.studyYear || '',
            group: body.group || '',
            startYear: body.startYear || '',
            receiptNumber: body.receiptNumber || '',
            installmentAmount: parseFloat(body.installmentAmount) || 0,
            date: body.date || '',
            notes: body.notes || '',
            annualTuition: parseFloat(body.annualTuition) || 0,
            totalPaidInstallments: parseFloat(body.totalPaidInstallments) || 0,
            discountAmount: parseFloat(body.discountAmount) || 0,
            remainingAmount: parseFloat(body.remainingAmount) || 0,
            created_at: new Date(),
            updated_at: new Date()
        }

        await db.collection('personal_installments').insertOne(record)

        const { _id, ...result } = record
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error creating personal installment:', error)
        return NextResponse.json({ error: 'Failed to create personal installment' }, { status: 500 })
    }
}
