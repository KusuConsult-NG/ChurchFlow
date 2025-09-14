import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { requireAuth, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  if (req.method === 'GET') {
    const staffId = (req.query.staffId as string) || undefined;
    const items = await prisma.leaveRequest.findMany({ where: { staffId }});
    return res.json({ items });
  }
  if (req.method === 'POST') {
    const { staffId, startDate, endDate, type } = req.body || {};
    if (!staffId || !startDate || !endDate || !type) return res.status(400).json({ error: 'Missing fields' });
    const lr = await prisma.leaveRequest.create({ data: { staffId, startDate: new Date(startDate), endDate: new Date(endDate), type }});
    return res.status(201).json({ leave: lr });
  }
  return res.status(405).end();
}
