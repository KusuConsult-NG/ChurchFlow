import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For development, return a mock signature
    // In production, you would generate a real signature using Cloudinary's API
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    return NextResponse.json({
      signature: 'mock-signature-for-development',
      timestamp: timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
      apiKey: process.env.CLOUDINARY_API_KEY || 'your-api-key'
    });
  } catch (error) {
    console.error('Cloudinary sign error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
