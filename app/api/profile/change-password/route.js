import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Force this route to be dynamic
export const dynamic = 'force-dynamic'

// POST - Change user password
export async function POST(request) {
  try {
    const { currentPassword, newPassword } = await request.json()
    
    // Basic validation
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: 'Current password and new password are required' }, { status: 400 })
    }
    
    if (newPassword.length < 6) {
      return NextResponse.json({ message: 'New password must be at least 6 characters long' }, { status: 400 })
    }
    
    // For now, we'll do a simple check against the hardcoded password
    // In a real application, you would hash and compare passwords properly
    if (currentPassword !== 'berdoz@code') {
      return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 })
    }
    
    const client = await clientPromise
    const db = client.db(process.env.DB_NAME || 'berdoz_management')
    
    // Update password in database (in real app, hash the password first)
    const result = await db.collection('user_profiles').updateOne(
      { username: 'berdoz' },
      { 
        $set: { 
          password: newPassword, // In production, hash this password
          passwordChangedAt: new Date(),
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )
    
    if (result.acknowledged) {
      // Also log the password change event
      const { v4: uuidv4 } = await import('uuid')
      await db.collection('security_logs').insertOne({
        id: uuidv4(),
        username: 'berdoz',
        action: 'password_change',
        timestamp: new Date().toISOString(),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
      
      return NextResponse.json({ message: 'Password changed successfully' })
    } else {
      throw new Error('Failed to update password')
    }
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}