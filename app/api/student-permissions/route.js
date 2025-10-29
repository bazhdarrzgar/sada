import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const permissions = await db.collection('student_permissions')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = permissions.map(permission => {
      const { _id, ...rest } = permission
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching student permissions:', error)
    return NextResponse.json({ error: 'Failed to fetch student permissions' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const newPermission = {
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('student_permissions').insertOne(newPermission)
    
    // Remove _id for response
    const { _id, ...result } = newPermission
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating student permission:', error)
    return NextResponse.json({ error: 'Failed to create student permission' }, { status: 500 })
  }
}