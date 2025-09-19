import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { testEmailConfiguration } from '@/lib/emailService';

// GET - Get current email settings
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    
    // Get email settings from database
    const settings = await db.collection('email_settings').findOne({ type: 'notification' });
    
    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        settings: {
          senderEmail: process.env.EMAIL_USER || '',
          targetEmail: process.env.NOTIFICATION_EMAIL || 'soyansoon9@gmail.com',
          notificationTime: '06:00',
          timezone: 'Asia/Baghdad',
          enabled: true
        }
      });
    }
    
    // Don't return password for security
    const { senderPassword, ...safeSettings } = settings;
    
    return NextResponse.json({
      success: true,
      settings: safeSettings
    });
    
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST - Update email settings
export async function POST(request) {
  try {
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME || 'berdoz_management');
    
    const settings = {
      type: 'notification',
      senderEmail: body.senderEmail,
      senderPassword: body.senderPassword, // In production, encrypt this
      targetEmail: body.targetEmail,
      notificationTime: body.notificationTime || '06:00',
      timezone: body.timezone || 'Asia/Baghdad',
      enabled: body.enabled !== false,
      updatedAt: new Date()
    };
    
    // Update or insert settings
    await db.collection('email_settings').replaceOne(
      { type: 'notification' },
      settings,
      { upsert: true }
    );
    
    // Test the new configuration
    const testResult = await testEmailConfiguration(body.senderEmail, body.senderPassword);
    
    return NextResponse.json({
      success: true,
      message: 'Email settings updated successfully',
      testResult
    });
    
  } catch (error) {
    console.error('Error updating email settings:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}