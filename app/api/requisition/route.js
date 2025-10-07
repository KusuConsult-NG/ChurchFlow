import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const pageSize = Math.max(
    1,
    Math.min(50, Number(url.searchParams.get('pageSize') || 10))
  );
  const where = {}; // Add empty where clause for all requisitions

  const [items, total] = await Promise.all([
    prisma.requisition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.requisition.count({ where })
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize)
  });
}

export async function POST(req) {
  const form = await req.formData();
  const data = Object.fromEntries(form.entries());
  data.amount = Number(data.amount || 0);

  await prisma.requisition.create({ data });
  return NextResponse.redirect(new URL('/admin/requisitions', req.url));
}
