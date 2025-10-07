import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  const { id } = params;

  await prisma.announcement.delete({
    where: { id }
  });

  return NextResponse.redirect(new URL('/admin', req.url));
}
