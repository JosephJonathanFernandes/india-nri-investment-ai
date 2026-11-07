import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from '../auth';
import { config } from '../config';
import { validate, apiError } from '../middleware/validation';
import { rateLimit } from '../middleware/rateLimit';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(rateLimit);

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Enter a valid email address').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',
  });
}

function clearAuthCookies(res: any) {
  res.clearCookie('access_token', { path: '/' });
  res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
}

/** POST /api/auth/register */
router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.body as z.infer<typeof registerSchema>;

  const existing = await db.findUserByEmail(email);
  if (existing) {
    apiError(res, 409, 'email_already_registered', 'An account with this email already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.createUser({
    email,
    name,
    passwordHash,
    role: 'USER',
    emailVerified: false,
  });

  // Auto-create empty profile placeholder (completed later via onboarding).
  await db.createUserProfile({
    userId: user.id,
    countryOfResidence: '',
    residencyStatus: '',
    investmentObjectives: [],
    riskPreference: '',
    investmentAmountRange: '',
    repatriationPreference: '',
    existingBanking: [],
    completedOnboarding: false,
  });

  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  setAuthCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
  });
});

/** POST /api/auth/login */
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>;

  const user = await db.findUserByEmail(email);
  if (!user) {
    apiError(res, 401, 'invalid_credentials', 'Invalid email or password.');
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    apiError(res, 401, 'invalid_credentials', 'Invalid email or password.');
    return;
  }

  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  setAuthCookies(res, accessToken, refreshToken);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
  });
});

/** POST /api/auth/logout */
router.post('/logout', optionalAuth, (_req: AuthRequest, res) => {
  clearAuthCookies(res);
  res.json({ ok: true, message: 'Signed out.' });
});

/** POST /api/auth/refresh */
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (!refreshToken) {
    apiError(res, 401, 'refresh_token_required', 'Refresh token missing.');
    return;
  }
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    apiError(res, 401, 'invalid_refresh_token', 'Refresh token invalid or expired.');
    return;
  }

  const user = await db.findUserById(payload.userId);
  if (!user) {
    apiError(res, 401, 'user_not_found', 'User not found.');
    return;
  }

  const tokenPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);
  setAuthCookies(res, accessToken, newRefreshToken);

  res.json({
    accessToken,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

/** GET /api/auth/me */
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await db.findUserById(req.user!.userId);
  if (!user) {
    apiError(res, 404, 'user_not_found', 'User not found.');
    return;
  }
  const profile = await db.findUserProfileByUserId(user.id);
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
    },
    profile,
    onboardingCompleted: profile?.completedOnboarding ?? false,
  });
});

export default router;
