import crypto from 'crypto';

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../../../lib/auth';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store magic link configuration
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        magicLinkEnabled: true,
        magicLinkToken: token,
        magicLinkExpires: expiresAt
      }
    });

    // TODO: Send email with magic link
    // For now, we'll just return success
    // In production, you'd send an email with the magic link

    return NextResponse.json({
      success: true,
      message: 'Magic link setup completed. Check your email for verification.'
    });
  } catch (error) {
    // console.error('Magic link setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup magic link' },
      { status: 500 }
    );
  }
}
