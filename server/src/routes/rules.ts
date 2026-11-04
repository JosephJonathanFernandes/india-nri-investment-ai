import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { validate, apiError } from '../middleware/validation';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const ruleSchema = z.object({
  ruleId: z.string().min(1),
  categoryId: z.string().min(1),
  jurisdiction: z.string().min(1),
  investorCategory: z.string().min(1),
  conditions: z.array(z.record(z.string(), z.any())).min(1),
  outcome: z.string().min(1),
  explanation: z.string().min(1),
  conditionsDetail: z.string().optional(),
  exceptions: z.string().optional(),
  accountType: z.string().optional(),
  documentation: z.string().optional(),
  repatriation: z.string().optional(),
  taxConsiderations: z.string().optional(),
  sourceUrl: z.string().url().optional().nullable(),
  sourceName: z.string().optional(),
  effectiveDate: z.string().datetime().optional().nullable(),
  lastVerified: z.string().datetime().optional().nullable(),
  reviewStatus: z.enum(['VERIFIED', 'PENDING', 'OUTDATED', 'ILLUSTRATIVE']),
  version: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/rules */
router.get('/', requireAuth, async (_req, res) => {
  const filter: any = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const q = (_req as any).query;
  if (q.categoryId) filter.categoryId = q.categoryId;
  if (q.jurisdiction) filter.jurisdiction = q.jurisdiction;
  if (q.investorCategory) filter.investorCategory = q.investorCategory;
  if (q.isActive !== undefined) filter.isActive = q.isActive === 'true';
  if (q.reviewStatus) filter.reviewStatus = q.reviewStatus;
  const rules = await db.listEligibilityRules(filter);
  res.json({ rules });
});

/** GET /api/rules/:id */
router.get('/:id', requireAuth, async (req, res) => {
  const rule = await db.findEligibilityRuleById(req.params.id);
  if (!rule) {
    apiError(res, 404, 'not_found', 'Rule not found.');
    return;
  }
  res.json({ rule });
});

/** POST /api/rules (admin) */
router.post('/', requireAuth, requireAdmin, validate(ruleSchema), async (req: AuthRequest, res) => {
  const data = req.body as z.infer<typeof ruleSchema>;
  const existing = await db.findEligibilityRuleByRuleId(data.ruleId);
  if (existing) {
    apiError(res, 409, 'rule_id_exists', 'A rule with this ruleId already exists.');
    return;
  }
  const rule = await db.createEligibilityRule({
    ...data,
    version: data.version ?? 1,
    isActive: data.isActive ?? true,
    effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
    lastVerified: data.lastVerified ? new Date(data.lastVerified) : undefined,
  });
  res.status(201).json({ rule });
});

/** PUT /api/rules/:id (admin) */
router.put('/:id', requireAuth, requireAdmin, validate(ruleSchema), async (req: AuthRequest, res) => {
  const rule = await db.findEligibilityRuleById(req.params.id);
  if (!rule) {
    apiError(res, 404, 'not_found', 'Rule not found.');
    return;
  }
  const data = req.body as z.infer<typeof ruleSchema>;
  const updated = await db.updateEligibilityRule(rule.id, {
    ...data,
    effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : rule.effectiveDate,
    lastVerified: data.lastVerified ? new Date(data.lastVerified) : rule.lastVerified,
  });
  res.json({ rule: updated });
});

/** DELETE /api/rules/:id (admin) */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const deleted = await db.deleteEligibilityRule(req.params.id);
  if (!deleted) {
    apiError(res, 404, 'not_found', 'Rule not found.');
    return;
  }
  res.json({ ok: true });
});

export default router;
