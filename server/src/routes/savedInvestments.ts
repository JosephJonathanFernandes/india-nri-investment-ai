import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { validate, apiError } from '../middleware/validation';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const savedSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  notes: z.string().optional(),
});

/** GET /api/saved-investments */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const saved = await db.listSavedInvestmentsByUser(req.user!.userId);
  res.json({ savedInvestments: saved });
});

/** POST /api/saved-investments */
router.post('/', requireAuth, validate(savedSchema), async (req: AuthRequest, res) => {
  const saved = await db.createSavedInvestment({
    userId: req.user!.userId,
    categoryId: req.body.categoryId,
    notes: req.body.notes ?? null,
  });
  res.status(201).json({ savedInvestment: saved });
});

/** DELETE /api/saved-investments/:id */
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const saved = await db.findSavedInvestmentById(req.params.id);
  if (!saved) {
    apiError(res, 404, 'not_found', 'Saved investment not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && saved.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own saved investments.');
    return;
  }
  await db.deleteSavedInvestment(req.params.id);
  res.json({ ok: true });
});

export default router;
