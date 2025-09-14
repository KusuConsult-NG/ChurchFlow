import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/src/lib/prisma';
import { requireAuth, withCors } from '@/src/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if (withCors(req,res)) return;
  const auth = await requireAuth(req,res); if (auth !== null) return;
  if (req.method === 'GET') {
    const orgId = (req.query.organizationId as string) || undefined;
    const items = await prisma.staff.findMany({ where: { organizationId: orgId }, orderBy:{ createdAt:'desc' }});
    return res.json({ items });
  }
  if (req.method === 'POST') {
    const { organizationId, firstName, lastName, email, phone, roleTitle, department, startDate, contractType, salary } = req.body || {};
    if (!organizationId || !firstName || !lastName || !roleTitle || !startDate || !contractType || !salary) return res.status(400).json({ error: 'Missing fields' });
    const staff = await prisma.staff.create({ data: { organizationId, firstName, lastName, email, phone, roleTitle, department, startDate: new Date(startDate), contractType, salary }});
    return res.status(201).json({ staff });
  }
  return res.status(405).end();
}
