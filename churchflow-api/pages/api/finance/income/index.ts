import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { requireAuth, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  const user = (req as any).user;
  if (req.method === 'GET') {
    const orgId = (req.query.organizationId as string) || undefined;
    const items = await prisma.income.findMany({ where: { organizationId: orgId }, orderBy: { date: 'desc' }});
    return res.json({ items });
  }
  if (req.method === 'POST') {
    const { organizationId, sourceName, narration, amount } = req.body || {};
    if (!organizationId || !sourceName || !narration || !amount) return res.status(400).json({ error: 'Missing fields' });
    const item = await prisma.income.create({ data: { organizationId, sourceName, narration, amount, createdById: user.id }});
    return res.status(201).json({ item });
  }
  return res.status(405).end();
}
