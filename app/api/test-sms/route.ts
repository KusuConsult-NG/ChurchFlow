import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message } = await request.json();

    // Validate input
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        {
          error:
            'Invalid phone number format. Use international format (e.g., +1234567890)'
        },
        { status: 400 }
      );
    }

    // Send SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
      to: result.to,
      from: result.from,
      body: result.body,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('SMS sending error:', error);

    return NextResponse.json(
      {
        error: 'Failed to send SMS',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Twilio SMS Test',
    status: 'active',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    features: [
      'Send SMS notifications',
      'Bulk SMS messaging',
      'Delivery tracking',
      'Error handling'
    ],
    usage: {
      method: 'POST',
      endpoint: '/api/test-sms',
      body: {
        phoneNumber: '+1234567890',
        message: 'Your test message here'
      }
    }
  });
}



