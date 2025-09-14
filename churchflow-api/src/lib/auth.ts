import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
export async function hashPassword(p: string){ const s = await bcrypt.genSalt(10); return bcrypt.hash(p, s); }
export async function comparePassword(p: string, h: string){ return bcrypt.compare(p, h); }
export function signToken(payload: object, expiresIn='7d'){ return (jwt as any).sign(payload, JWT_SECRET, { expiresIn }); }
export function verifyToken(token: string){ return (jwt as any).verify(token, JWT_SECRET); }

export async function requireAuth(req: any, res: any){
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const d: any = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: d.userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    (req as any).user = user;
    return null;
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function withCors(req:any, res:any){
  const origin = process.env.CORS_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return true; }
  return false;
}
