import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '../../../lib/auth';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const _session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !['ADMIN', 'GCC', 'DCC'].includes(session.user.role)
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const jobs = await prisma.dataExport.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { name: true, email: true } }
      }
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    // console.error('Get export jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch export jobs' },
      { status: 500 }
    );
  }
}
