import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function hash(p: string) { return bcrypt.hash(p, 10); }
export async function cmp(p: string, h: string) { return bcrypt.compare(p, h); }
export function sign(payload: object) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); }

export interface AuthRequest extends Request { user?: { id: string; role: string; email: string }; }

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: payload.userId, role: payload.role, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
