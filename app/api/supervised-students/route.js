import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('supervised_students')
    
    // Try to get data from database
    const supervisedStudents = await collection.find({}).toArray()
    
    // Remove MongoDB _id
    const result = supervisedStudents.map(item => {
      const { _id, ...rest } = item
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ error: 'Failed to fetch supervised students' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Generate ID if not provided
    if (!data.id) {
      data.id = uuidv4()
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('supervised_students')
    
    const newData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await collection.insertOne(newData)
    
    // Remove _id for response
    const { _id, ...result } = newData
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating supervised student:', error)
    return NextResponse.json({ error: 'Failed to create supervised student' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()
    const { id, _id, ...updateData } = data
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('supervised_students')
    
    updateData.updated_at = new Date()
    
    await collection.updateOne({ id }, { $set: updateData })
    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Error updating supervised student:', error)
    return NextResponse.json({ error: 'Failed to update supervised student' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    const collection = db.collection('supervised_students')
    
    await collection.deleteOne({ id })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supervised student:', error)
    return NextResponse.json({ error: 'Failed to delete supervised student' }, { status: 500 })
  }
}