import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// GET specific personal installment
export async function GET(request, { params }) {
    try {
        const { id } = params
        const client = await clientPromise
        const db = client.db(process.env.DB_NAME || 'berdoz_management')

        const record = await db.collection('personal_installments').findOne({ id })

        if (!record) {
            return NextResponse.json({ error: 'Personal installment not found' }, { status: 404 })
        }

        const { _id, ...result } = record
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error fetching personal installment:', error)
        return NextResponse.json({ error: 'Failed to fetch personal installment' }, { status: 500 })
    }
}

// PUT update personal installment
export async function PUT(request, { params }) {
    try {
        const { id } = params
        const body = await request.json()
        const client = await clientPromise
        const db = client.db(process.env.DB_NAME || 'berdoz_management')

        const existing = await db.collection('personal_installments').findOne({ id })
        if (!existing) {
            return NextResponse.json({ error: 'Personal installment not found' }, { status: 404 })
        }

        const updateData = {
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
            updated_at: new Date()
        }

        await db.collection('personal_installments').updateOne(
            { id },
            { $set: updateData }
        )

        const updatedRecord = await db.collection('personal_installments').findOne({ id })
        const { _id, ...result } = updatedRecord
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error updating personal installment:', error)
        return NextResponse.json({ error: 'Failed to update personal installment' }, { status: 500 })
    }
}

// DELETE personal installment
export async function DELETE(request, { params }) {
    try {
        const { id } = params
        const client = await clientPromise
        const db = client.db(process.env.DB_NAME || 'berdoz_management')

        const result = await db.collection('personal_installments').deleteOne({ id })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Personal installment not found' }, { status: 404 })
        }

        return NextResponse.json({ message: 'Personal installment deleted successfully' })
    } catch (error) {
        console.error('Error deleting personal installment:', error)
        return NextResponse.json({ error: 'Failed to delete personal installment' }, { status: 500 })
    }
}
