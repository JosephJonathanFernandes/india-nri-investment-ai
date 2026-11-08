import { Router } from 'express';
import { db } from '../db';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Helper: detect conflicting rules (same category+jurisdiction+investorCategory, different outcomes)
function findConflicts(rules: any[]): any[] {
  const groups = new Map<string, any[]>();
  for (const r of rules) {
    const key = `${r.categoryId}|${r.jurisdiction}|${r.investorCategory}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }
  const conflicts: any[] = [];
  for (const [key, group] of groups) {
    const outcomes = new Set(group.map((r) => r.outcome));
    if (outcomes.size > 1) {
      conflicts.push({ key, rules: group });
    }
  }
  return conflicts;
}

/** GET /api/admin/rules/conflicts - Rules with conflicting outcomes for same inputs */
router.get('/rules/conflicts', requireAuth, requireAdmin, async (_req, res) => {
  const allRules = await db.listEligibilityRules({ isActive: true });
  const conflicts = findConflicts(allRules);
  res.json({ conflicts });
});

/** GET /api/admin/rules/expiring - Rules expiring soon or past verification date */
router.get('/rules/expiring', requireAuth, requireAdmin, async (_req, res) => {
  const allRules = await db.listEligibilityRules({ isActive: true });
  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const expiring = allRules.filter((r: any) => {
    // Past effectiveTo
    if (r.effectiveTo && new Date(r.effectiveTo) < now) return true;
    // Not verified in over 12 months
    if (r.lastVerified && new Date(r.lastVerified) < twelveMonthsAgo) return true;
    // No verification date at all
    if (!r.lastVerified) return true;
    return false;
  });

  res.json({ expiringRules: expiring });
});

/** POST /api/admin/rules/:id/publish - Publish a DRAFT rule */
router.post('/rules/:id/publish', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const rule = await db.findEligibilityRuleById(req.params.id);
  if (!rule) {
    res.status(404).json({ error: 'not_found', message: 'Rule not found.' });
    return;
  }
  if (rule.status === 'PUBLISHED') {
    res.status(400).json({ error: 'already_published', message: 'Rule is already published.' });
    return;
  }
  const updated = await db.updateEligibilityRule(rule.id, {
    ...rule,
    status: 'PUBLISHED',
    lastVerified: new Date(),
  });
  res.json({ rule: updated });
});

/** POST /api/admin/rules/:id/archive - Archive a rule */
router.post('/rules/:id/archive', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const rule = await db.findEligibilityRuleById(req.params.id);
  if (!rule) {
    res.status(404).json({ error: 'not_found', message: 'Rule not found.' });
    return;
  }
  const updated = await db.updateEligibilityRule(rule.id, {
    ...rule,
    status: 'ARCHIVED',
    isActive: false,
  });
  res.json({ rule: updated });
});


/** GET /api/admin/unresolved-checks */
router.get('/unresolved-checks', requireAuth, requireAdmin, async (_req, res) => {
  // Fetch all checks and filter those whose latest overall outcome is unresolved/verification.
  // MemoryDb doesn't support cross-user queries easily, so fetch per-user via listUsers.
  const users = await db.listUsers();
  const unresolved: any[] = [];
  for (const u of users) {
    const checks = await db.listEligibilityChecksByUser(u.id);
    for (const check of checks) {
      if (
        check.overallOutcome === 'UNRESOLVED' ||
        check.overallOutcome === 'VERIFICATION_REQUIRED'
      ) {
        const results = await db.listEligibilityResultsByCheck(check.id);
        unresolved.push({ user: { id: u.id, email: u.email, name: u.name }, check, results });
      }
    }
  }
  unresolved.sort(
    (a, b) => new Date(b.check.createdAt).getTime() - new Date(a.check.createdAt).getTime()
  );
  res.json({ unresolvedChecks: unresolved });
});

/** GET /api/admin/updates */
router.get('/updates', requireAuth, requireAdmin, async (_req, res) => {
  const updates = await db.listRegulatoryUpdates(false);
  res.json({ updates });
});

/** POST /api/admin/updates */
router.post('/updates', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  const { title, summary, sourceUrl, isActive } = req.body as {
    title: string;
    summary: string;
    sourceUrl?: string;
    isActive?: boolean;
  };
  if (!title || !summary) {
    res.status(400).json({ error: 'validation_error', message: 'Title and summary are required.' });
    return;
  }
  const update = await db.createRegulatoryUpdate({
    title,
    summary,
    sourceUrl: sourceUrl ?? null,
    isActive: isActive ?? true,
  });
  res.status(201).json({ update });
});

export default router;
