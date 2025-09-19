import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// GET - Get user profile
export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('sada_school')
    
    // Get profile data for the current user (berdoz)
    const profile = await db.collection('user_profiles').findOne({ username: 'berdoz' })
    
    if (!profile) {
      // Return default profile if none exists
      const defaultProfile = {
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
        emailNotifications: true,
        systemAlerts: true,
        backupReminders: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
    const db = client.db('sada_school')
    
    // Update profile data
    const updateData = {
      ...profileData,
      updatedAt: new Date()
    }
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData._id
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