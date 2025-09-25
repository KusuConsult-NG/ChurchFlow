import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `ChurchFlow (${session.user.email})`,
      issuer: 'ChurchFlow',
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Store the secret in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totpSecret: secret.base32,
        twoFactorEnabled: false, // Will be enabled after verification
      },
    });

    return NextResponse.json({
      qrCode: qrCodeUrl,
      secret: secret.base32,
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: 'Failed to setup TOTP' }, { status: 500 });
  }
}
