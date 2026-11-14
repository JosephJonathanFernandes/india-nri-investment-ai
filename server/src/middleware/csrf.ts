import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * CSRF protection middleware for state-changing requests (POST/PUT/DELETE/PATCH).
 *
 * Strategy: Double-submit cookie pattern.
 * - A CSRF token is stored in a httpOnly cookie (XSRF-TOKEN).
 * - Client must send the same token in the X-XSRF-TOKEN header for state-changing requests.
 * - Server compares the two values; if they match, the request is allowed.
 *
 * This protects against Cross-Site Request Forgery attacks because browsers
 * automatically send cookies but cannot read them to add to custom headers
 * (unless CORS explicitly allows it with credentials).
 */

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-xsrf-token';

/**
 * Generate a random CSRF token.
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Middleware that ensures a CSRF token cookie exists for the client.
 * Should be applied to GET /api/auth/me or similar safe endpoints so the
 * client can read the cookie value.
 */
export function ensureCsrfToken(req: Request, res: Response, next: NextFunction): void {
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    res.cookie(CSRF_COOKIE_NAME, generateCsrfToken(), {
      httpOnly: false, // Client needs to read this to send in header
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
  next();
}

/**
 * Middleware that validates the CSRF token on state-changing requests.
 * Applies to POST, PUT, PATCH, DELETE methods.
 */
export function validateCsrfToken(req: Request, res: Response, next: NextFunction): void {
  // Only validate state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({
      error: 'csrf_token_missing',
      message: 'CSRF token validation failed. Please refresh the page and try again.',
    });
    return;
  }

  next();
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
