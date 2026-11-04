import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { validate, apiError } from '../middleware/validation';
import { requireAuth, requireOwnershipOrAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const profileSchema = z.object({
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  residencyStatus: z.string().min(1, 'Residency status is required'),
  investmentObjectives: z.array(z.string()).min(1, 'Select at least one investment objective'),
  riskPreference: z.string().min(1, 'Risk preference is required'),
  investmentAmountRange: z.string().min(1, 'Investment amount range is required'),
  repatriationPreference: z.string().min(1, 'Repatriation preference is required'),
  existingBanking: z.array(z.string()).optional(),
  completedOnboarding: z.boolean().optional(),
});

/** GET /api/profile */
router.get('/', requireAuth, requireOwnershipOrAdmin, async (req: AuthRequest, res) => {
  const userId = (req.params.userId as string) || req.user!.userId;
  const user = await db.findUserById(userId);
  if (!user) {
    apiError(res, 404, 'user_not_found', 'User not found.');
    return;
  }
  const profile = await db.findUserProfileByUserId(userId);
  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    profile,
  });
});

/** PUT /api/profile */
router.put('/', requireAuth, requireOwnershipOrAdmin, validate(profileSchema), async (req: AuthRequest, res) => {
  const userId = (req.params.userId as string) || req.user!.userId;
  const data = req.body as z.infer<typeof profileSchema>;

  let profile = await db.findUserProfileByUserId(userId);
  if (!profile) {
    profile = await db.createUserProfile({
      userId,
      ...data,
    });
  } else {
    profile = await db.updateUserProfile(userId, data);
  }

  res.json({ profile });
});

export default router;
