import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { requireAuth, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { staffId, month, year, grossPay, deductions } = req.body || {};
  if (!staffId || !month || !year || !grossPay) return res.status(400).json({ error: 'Missing fields' });
  const net = Number(grossPay) - (deductions?.total || 0);
  const payroll = await prisma.payroll.upsert({
    where: { staffId_month_year: { staffId, month, year }},
    update: { grossPay, deductions, netPay: net },
    create: { staffId, month, year, grossPay, deductions, netPay: net }
  });
  res.status(201).json({ payroll });
}
