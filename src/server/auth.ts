import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.ts';
import { HRUser } from '../types.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'apex-recruitment-secret-key-prod-2026-secure-auth-jwt';

export interface AuthenticatedRequest extends Request {
  hrUser?: HRUser;
}

export function generateHRToken(user: HRUser): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function requireHRAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Check cookie or Authorization header
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.hr_auth_token) {
    token = req.cookies.hr_auth_token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access denied: Authentication required for HR resources.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = db.getUserById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Session expired or user account not found.',
      });
      return;
    }

    req.hrUser = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please log in again.',
    });
    return;
  }
}
