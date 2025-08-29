import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/emailService';

// POST - Send test email
export async function POST(request) {
  try {
    const body = await request.json();
    
    const result = await sendTestEmail(
      body.targetEmail,
      body.senderEmail || null,
      body.senderPassword || null
    );
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error,
      messageId: result.messageId
    });
    
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}