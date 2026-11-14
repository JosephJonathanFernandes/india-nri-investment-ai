import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Per-endpoint rate limit configuration.
 * Each endpoint can have its own window and max requests.
 */
interface RateLimitConfig {
  windowMs: number;
  max: number;
}

// Default per-endpoint rate limits
const ENDPOINT_LIMITS: Record<string, RateLimitConfig> = {
  // Authentication endpoints - stricter limits
  '/api/auth/register': { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 per 15 min
  '/api/auth/refresh': { windowMs: 15 * 60 * 1000, max: 10 }, // 10 per 15 min
  '/api/eligibility/check': { windowMs: 60 * 1000, max: 10 }, // 10 per minute
  '/api/assistant/chat': { windowMs: 60 * 1000, max: 10 }, // 10 per minute
  // Default for everything else
  default: { windowMs: config.rateLimitWindowMs, max: config.rateLimitMax },
};

const hits = new Map<string, { count: number; resetAt: number }>();

function getKey(req: Request): string {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  return `${ip}:${req.path}`;
}

function getConfig(path: string): RateLimitConfig {
  return ENDPOINT_LIMITS[path] ?? ENDPOINT_LIMITS.default;
}

/**
 * Per-endpoint rate limiting middleware.
 * Different endpoints can have different window/max configurations.
 */
export function rateLimit(req: Request, res: Response, next: NextFunction): void {
  const key = getKey(req);
  const cfg = getConfig(req.path);
  const now = Date.now();
  let entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + cfg.windowMs };
    hits.set(key, entry);
  } else {
    entry.count += 1;
  }

  const remaining = Math.max(0, cfg.max - entry.count);
  res.setHeader('X-RateLimit-Limit', cfg.max);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());

  if (entry.count > cfg.max) {
    res.status(429).json({
      error: 'rate_limited',
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    });
    return;
  }
  next();
}

/**
 * Middleware factory for applying a specific rate limit config to a route.
 * Usage: router.post('/login', rateLimitFor('/api/auth/login'), ...)
 */
export function rateLimitFor(path: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = getKey(req);
    const cfg = getConfig(path);
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + cfg.windowMs };
      hits.set(key, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, cfg.max - entry.count);
    res.setHeader('X-RateLimit-Limit', cfg.max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', new Date(entry.resetAt).toISOString());

    if (entry.count > cfg.max) {
      res.status(429).json({
        error: 'rate_limited',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
      return;
    }
    next();
  };
}
