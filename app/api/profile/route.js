import { NextResponse } from 'next/server'
import clientPromise from '@/lib/sqlite'
import { v4 as uuidv4 } from 'uuid'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// GET - Get user profile
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('sada')
    
    // Get profile data for the current user (berdoz)
    const profile = await db.collection('user_profiles').findOne({ username: 'berdoz' })
    
    if (!profile) {
      // Return default profile if none exists
      const now = new Date().toISOString()
      
      const defaultProfile = {
        id: uuidv4(),
        username: 'berdoz',
        displayName: 'Berdoz Administrator',
        email: 'admin@berdoz.edu.krd',
        bio: 'System Administrator for Berdoz Educational Institution Management System',
        phone: '+964 750 123 4567',
        location: 'Erbil, Kurdistan Region, Iraq',
        institution: 'Berdoz Educational Institution',
        role: 'System Administrator',
        joinDate: '2024-01-01',
        avatar: '',
        language: 'kurdish',
        theme: 'system',
        emailNotifications: 1,
        systemAlerts: 1,
        backupReminders: 1,
        created_at: now,
        updated_at: now,
        createdAt: now,
        updatedAt: now
      }
      
      // Create default profile in database
      await db.collection('user_profiles').insertOne(defaultProfile)
      return NextResponse.json(defaultProfile)
    }
    
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request) {
  try {
    const profileData = await request.json()
    const client = await clientPromise
    const db = client.db('sada')
    
    // Update profile data
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData._id
    delete updateData.id
    delete updateData.created_at
    delete updateData.createdAt
    
    const result = await db.collection('user_profiles').updateOne(
      { username: 'berdoz' },
      { $set: updateData },
      { upsert: true }
    )
    
    if (result.acknowledged) {
      return NextResponse.json({ message: 'Profile updated successfully' })
    } else {
      throw new Error('Failed to update profile')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
