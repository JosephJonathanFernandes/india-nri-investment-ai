import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../auth';


export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: string };
}

/**
 * Requires a valid access token (from Authorization: Bearer <token> or
 * httpOnly cookie `access_token`). Populates req.user.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    res
      .status(401)
      .json({ error: 'authentication_required', message: 'Please sign in to continue.' });
    return;
  }
  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({
      error: 'invalid_token',
      message: 'Session expired or invalid. Please sign in again.',
    });
    return;
  }
  req.user = { userId: payload.userId, email: payload.email, role: payload.role };
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }
  const payload = verifyAccessToken(token);
  if (payload) req.user = { userId: payload.userId, email: payload.email, role: payload.role };
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'authentication_required', message: 'Please sign in.' });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'forbidden', message: 'Administrator access required.' });
    return;
  }
  next();
}

function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.cookies?.access_token;
  if (cookie) return cookie;
  return null;
}

/**
 * Ensures users can only access their own resources unless they are an admin.
 * Expects req.params.userId or req.body.userId to match req.user.userId.
 */
export function requireOwnershipOrAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'authentication_required', message: 'Please sign in.' });
    return;
  }
  const target = req.params.userId || req.body?.userId;
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }
  if (target && target !== req.user.userId) {
    res
      .status(403)
      .json({ error: 'forbidden', message: 'You can only access your own resources.' });
    return;
  }
  next();
}
