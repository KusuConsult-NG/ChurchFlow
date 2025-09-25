import { PrismaClient } from "@prisma/client"; import { NextResponse } from "next/server";
const prisma=new PrismaClient();
export async function GET(req){
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get('page')||1));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get('pageSize')||10)));
  const eventId=(new URL(req.url)).searchParams.get('eventId')||''; const where = eventId? { eventId } : {};
  const [items, total] = await Promise.all([
    prisma.attendance.findMany({ where, orderBy:{ createdAt:'desc' }, skip:(page-1)*pageSize, take:pageSize }),
    prisma.attendance.count({ where })
  ]);
  return NextResponse.json({ items, total, page, pageSize, pages: Math.ceil(total/pageSize) });
}
export async function POST(req){
  const form=await req.formData();
  const data=Object.fromEntries(form.entries());


  await prisma.attendance.create({ data });
  return NextResponse.redirect(new URL('/(app)/attendance', req.url));
}
