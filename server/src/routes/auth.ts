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
import { ensureCsrfToken } from '../middleware/csrf';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(rateLimit);

/** GET /api/auth/csrf-token - Get CSRF token cookie */
router.get('/csrf-token', ensureCsrfToken, (_req, res) => {
  res.json({ ok: true });
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Enter a valid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(config.passwordMinLength, `Password must be at least ${config.passwordMinLength} characters`)
    .refine(
      (p) => !config.passwordRequireUppercase || /[A-Z]/.test(p),
      'Password must contain at least one uppercase letter',
    )
    .refine(
      (p) => !config.passwordRequireLowercase || /[a-z]/.test(p),
      'Password must contain at least one lowercase letter',
    )
    .refine(
      (p) => !config.passwordRequireNumber || /[0-9]/.test(p),
      'Password must contain at least one number',
    )
    .refine(
      (p) => !config.passwordRequireSymbol || /[^A-Za-z0-9]/.test(p),
      'Password must contain at least one special character',
    ),
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

  // Check if account is locked out
  if (user.lockoutUntil && new Date(user.lockoutUntil) > new Date()) {
    const remainingMs = new Date(user.lockoutUntil).getTime() - new Date().getTime();
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    apiError(res, 423, 'account_locked', `Account is locked. Try again in ${remainingMinutes} minute(s).`);
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    // Increment failed login attempts
    const attempts = (user.failedLoginAttempts ?? 0) + 1;
    let lockoutUntil: Date | null = null;
    if (attempts >= config.lockoutMaxAttempts) {
      lockoutUntil = new Date(Date.now() + config.lockoutDurationMs);
    }
    await db.updateUser(user.id, { failedLoginAttempts: attempts, lockoutUntil });

    const remaining = config.lockoutMaxAttempts - attempts;
    apiError(res, 401, 'invalid_credentials', {
      message: 'Invalid email or password.',
      remainingAttempts: Math.max(0, remaining),
      locked: attempts >= config.lockoutMaxAttempts,
    } as any);
    return;
  }

  // Successful login - reset failed attempts
  if ((user.failedLoginAttempts ?? 0) > 0 || user.lockoutUntil) {
    await db.updateUser(user.id, { failedLoginAttempts: 0, lockoutUntil: null });
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

/** GET /api/auth/account/export - Export all user data (GDPR/PDPA) */
router.get('/account/export', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  const user = await db.findUserById(userId);
  const profile = await db.findUserProfileByUserId(userId);
  const checks = await db.listEligibilityChecksByUser(userId);
  const checklists = await db.listChecklistsByUser(userId);
  const savedInvestments = await db.listSavedInvestmentsByUser(userId);
  const auditLogs = await db.listAuditLogs({ userId, limit: 1000 });
  const conversations = await db.listChatConversations(userId);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      role: user?.role,
      emailVerified: user?.emailVerified,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    },
    profile,
    eligibilityChecks: checks,
    checklists,
    savedInvestments,
    auditLogs,
    conversations,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="nri-export-${userId}-${new Date().toISOString().slice(0, 10)}.json"`
  );
  res.json(exportData);
});

/** DELETE /api/account - Delete account and all associated data (GDPR/PDPA right to erasure) */
router.delete('/account', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;

  // Fetch all user data
  const checks = await db.listEligibilityChecksByUser(userId);
  const checklists = await db.listChecklistsByUser(userId);
  const savedInvestments = await db.listSavedInvestmentsByUser(userId);

  // Delete saved investments
  for (const saved of savedInvestments) {
    await db.deleteSavedInvestment(saved.id);
  }

  // Delete checklist items and checklists
  for (const checklist of checklists) {
    const items = await db.listChecklistItems(checklist.id);
    for (const item of items) {
      await db.deleteChecklistItem(item.id);
    }
    await db.deleteChecklist(checklist.id);
  }

  // Delete eligibility checks (results cascade with check in memory db)
  for (const check of checks) {
    await db.deleteEligibilityCheck(check.id);
  }

  // Delete user profile
  await db.updateUserProfile(userId, {
    countryOfResidence: '',
    residencyStatus: '',
    investmentObjectives: [],
    riskPreference: '',
    investmentAmountRange: '',
    repatriationPreference: '',
    existingBanking: [],
    completedOnboarding: false,
  });

  // Delete user account
  await db.deleteUser(userId);

  // Clear auth cookies
  clearAuthCookies(res);

  res.json({
    ok: true,
    message: 'Account and all associated data have been deleted.',
  });
});

export default router;
