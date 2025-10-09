import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const teachers = await db.collection('teachers')
      .find({})
      .sort({ updated_at: -1 })
      .limit(1000)
      .toArray()
    
    // Remove SQLite _id
    const result = teachers.map(teacher => {
      const { _id, ...rest } = teacher
      return rest
    })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const newTeacher = {
      id: uuidv4(),
      fullName: data.fullName || '',
      birthYear: data.birthYear || '',
      certificate: data.certificate || '',
      jobTitle: data.jobTitle || '',
      specialist: data.specialist || '',
      graduationDate: data.graduationDate || '',
      startDate: data.startDate || '',
      previousInstitution: data.previousInstitution || '',
      bloodType: data.bloodType || '',
      certificateImages: data.certificateImages || [], // New field for certificate images
      notes: data.notes || '',
      cv: data.cv || null, // CV data
      created_at: new Date(),
      updated_at: new Date()
    }
    
    await db.collection('teachers').insertOne(newTeacher)
    
    // Remove _id for response
    const { _id, ...result } = newTeacher
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const data = await request.json()
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const { id, _id, ...updateData } = data
    updateData.updated_at = new Date()
    
    const result = await db.collection('teachers').updateOne(
      { id },
      { $set: updateData }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }
    
    return NextResponse.json({ id, ...updateData })
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    const result = await db.collection('teachers').deleteOne({ id })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }
    
    return NextResponse.json({ message: 'Teacher deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 })
  }
}