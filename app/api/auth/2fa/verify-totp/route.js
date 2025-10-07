import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import speakeasy from 'speakeasy';

import { authOptions } from '../../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await req.json();

    // Get user's TOTP secret
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { totpSecret: true }
    });

    if (!user?.totpSecret) {
      return NextResponse.json(
        { error: 'TOTP not configured' },
        { status: 400 }
      );
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps tolerance
    });

    if (verified) {
      // Enable 2FA for the user
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorEnabled: true }
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }
  } catch (error) {
    // console.error('TOTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
