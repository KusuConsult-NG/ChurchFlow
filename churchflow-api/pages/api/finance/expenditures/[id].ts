import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { requireAuth, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  const { id } = req.query as { id: string };
  if (req.method === 'PATCH') {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'Missing status' });
    const updated = await prisma.expenditure.update({ where: { id }, data: { status }});
    return res.json({ item: updated });
  }
  if (req.method === 'GET') {
    const item = await prisma.expenditure.findUnique({ where: { id }});
    if (!item) return res.status(404).json({ error: 'Not found' });
    return res.json({ item });
  }
  return res.status(405).end();
}
