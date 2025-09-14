import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { requireAuth, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  if (req.method !== 'POST') return res.status(405).end();
  const { name, council, country, state, lga, parentId } = req.body || {};
  if (!name || !council) return res.status(400).json({ error: 'name & council are required' });
  const org = await prisma.organization.create({ data: { name, council, country, state, lga, parentId }});
  await prisma.membership.create({ data: { userId: (req as any).user.id, organizationId: org.id, role: 'SUPER_ADMIN' }});
  res.status(201).json({ org });
}
