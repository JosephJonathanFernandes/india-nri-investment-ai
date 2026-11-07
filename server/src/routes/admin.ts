import { Router } from 'express';
import { db } from '../db';
import { requireAuth, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

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
