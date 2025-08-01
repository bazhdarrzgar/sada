import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// GET all student permissions
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const records = await db.collection('student_permissions')
      .find({})
      .sort({ created_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove MongoDB _id
    const result = records.map(record => {
      const { _id, ...rest } = record
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching student permissions:', error)
    return NextResponse.json({ error: 'Failed to fetch student permissions' }, { status: 500 })
  }
}

// POST create new student permission
export async function POST(request) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const permissionRecord = {
      id: uuidv4(),
      studentName: body.studentName,
      department: body.department,
      stage: body.stage,
      leaveDuration: body.leaveDuration,
      startDate: body.startDate,
      endDate: body.endDate,
      reason: body.reason,
      status: body.status || 'چاوەڕوان',
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('student_permissions').insertOne(permissionRecord)
    
    // Remove _id for response
    const { _id, ...result } = permissionRecord
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating student permission:', error)
    return NextResponse.json({ error: 'Failed to create student permission' }, { status: 500 })
  }
}