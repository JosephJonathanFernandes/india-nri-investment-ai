import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + config.rateLimitWindowMs };
    hits.set(ip, entry);
  } else {
    entry.count += 1;
  }
  res.setHeader('X-RateLimit-Limit', config.rateLimitMax);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, config.rateLimitMax - entry.count));
  res.setHeader('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());
  if (entry.count > config.rateLimitMax) {
    res.status(429).json({
      error: 'rate_limited',
      message: 'Too many requests. Please try again later.',
    });
    return;
  }
  next();
}
