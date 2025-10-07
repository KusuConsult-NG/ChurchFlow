import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
const prisma = new PrismaClient();
export async function POST(req, { params }) {
  const form = await req.formData();
  const _m = (form.get('_method') || '').toUpperCase();
  if (_m === 'DELETE') {
    await prisma.requisition.delete({ where: { id: params.id } });
    return NextResponse.redirect(new URL('/admin/requisitions', req.url));
  }
  if (_m === 'PATCH') {
    const data = Object.fromEntries(form.entries());
    delete data._method;
    await prisma.requisition.update({ where: { id: params.id }, data });
    return NextResponse.redirect(new URL('/admin/requisitions', req.url));
  }
  return new NextResponse('Unsupported', { status: 400 });
}
