import { Router, Request, Response } from 'express';
import { db } from '../db';
import { optionalAuth } from '../middleware/auth';

const router = Router();

async function listCategories(_req: Request, res: Response) {
  const categories = await db.listInvestmentCategories(true);
  res.json({ categories });
}

async function getCategoryBySlug(req: Request, res: Response) {
  const category = await db.findInvestmentCategoryBySlug(req.params.slug);
  if (!category) {
    res.status(404).json({ error: 'not_found', message: 'Investment category not found.' });
    return;
  }
  res.json({ category });
}

// List all categories (explicit /categories path + root / alias, registered before :slug).
router.get('/categories', optionalAuth, listCategories);
router.get('/', optionalAuth, listCategories);
// Single category by slug (must come after literal routes).
router.get('/:slug', optionalAuth, getCategoryBySlug);

export default router;
