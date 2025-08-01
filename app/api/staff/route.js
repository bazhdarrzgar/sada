import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all تۆمارەکانی ستاف
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('staff_records')
      .find({})
      .sort({ created_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id and handle pass field alias
    const result = records.map(record => {
      const { _id, pass, ...rest } = record
      return {
        ...rest,
        pass_grade: pass || rest.pass_grade || ''
      }
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching تۆمارەکانی ستاف:', error)
    return NextResponse.json({ error: 'Failed to fetch تۆمارەکانی ستاف' }, { status: 500 })
  }
}

// POST create new staff record
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const staffRecord = {
      id: uuidv4(),
      fullName: body.fullName,
      mobile: body.mobile,
      address: body.address,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth,
      certificate: body.certificate,
      age: parseInt(body.age),
      education: body.education,
      attendance: body.attendance || 'Present',
      date: body.date || new Date().toISOString().split('T')[0],
      department: body.department,
      pass: body.pass_grade || body.pass || '',
      contract: body.contract || 'Permanent',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('staff_records').insertOne(staffRecord)
    
    // Remove _id and convert pass back to pass_grade for response
    const { _id, pass, ...result } = staffRecord
    return NextResponse.json({
      ...result,
      pass_grade: pass
    })
  } catch (error) {
    console.error('Error creating staff record:', error)
    return NextResponse.json({ error: 'Failed to create staff record' }, { status: 500 })
  }
}