import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../middleware/auth';

const router = Router();

/** GET /api/sources */
router.get('/', requireAuth, async (_req, res) => {
  const sources = await db.listRegulatorySources();
  res.json({ sources });
});

export default router;
