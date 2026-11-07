import { Router } from 'express';
import { z } from 'zod';
import { db, type StoreChecklist } from '../db';
import { validate, apiError } from '../middleware/validation';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const checklistSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
});

const itemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  isConditional: z.boolean().optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
});

const updateItemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  isConditional: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
});

/** GET /api/checklists */
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const lists = await db.listChecklistsByUser(req.user!.userId);
  const enriched = await Promise.all(
    lists.map(async (list: StoreChecklist) => {
      const items = await db.listChecklistItems(list.id);
      return { ...list, items };
    })
  );
  res.json({ checklists: enriched });
});

/** POST /api/checklists */
router.post('/', requireAuth, validate(checklistSchema), async (req: AuthRequest, res) => {
  const list = await db.createChecklist({
    userId: req.user!.userId,
    title: req.body.title,
    category: req.body.category ?? null,
  });
  res.status(201).json({ checklist: list });
});

/** GET /api/checklists/:id */
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const list = await db.findChecklistById(req.params.id);
  if (!list) {
    apiError(res, 404, 'not_found', 'Checklist not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
    return;
  }
  const items = await db.listChecklistItems(list.id);
  res.json({ checklist: { ...list, items } });
});

/** PUT /api/checklists/:id */
router.put('/:id', requireAuth, validate(checklistSchema), async (req: AuthRequest, res) => {
  const list = await db.findChecklistById(req.params.id);
  if (!list) {
    apiError(res, 404, 'not_found', 'Checklist not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
    return;
  }
  const updated = await db.updateChecklist(req.params.id, {
    title: req.body.title,
    category: req.body.category ?? null,
  });
  res.json({ checklist: updated });
});

/** DELETE /api/checklists/:id */
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const list = await db.findChecklistById(req.params.id);
  if (!list) {
    apiError(res, 404, 'not_found', 'Checklist not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
    return;
  }
  await db.deleteChecklist(req.params.id);
  res.json({ ok: true });
});

/** GET /api/checklists/:id/items */
router.get('/:id/items', requireAuth, async (req: AuthRequest, res) => {
  const list = await db.findChecklistById(req.params.id);
  if (!list) {
    apiError(res, 404, 'not_found', 'Checklist not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
    return;
  }
  const items = await db.listChecklistItems(req.params.id);
  res.json({ items });
});

/** POST /api/checklists/:id/items */
router.post('/:id/items', requireAuth, validate(itemSchema), async (req: AuthRequest, res) => {
  const list = await db.findChecklistById(req.params.id);
  if (!list) {
    apiError(res, 404, 'not_found', 'Checklist not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
    return;
  }
  const items = await db.listChecklistItems(req.params.id);
  const order = req.body.order ?? items.length;
  const item = await db.createChecklistItem({
    checklistId: req.params.id,
    title: req.body.title,
    description: req.body.description ?? null,
    isRequired: req.body.isRequired ?? false,
    isConditional: req.body.isConditional ?? true,
    category: req.body.category ?? null,
    order,
  });
  res.status(201).json({ item });
});

/** PUT /api/checklists/:id/items/:itemId */
router.put(
  '/:id/items/:itemId',
  requireAuth,
  validate(updateItemSchema),
  async (req: AuthRequest, res) => {
    const list = await db.findChecklistById(req.params.id);
    if (!list) {
      apiError(res, 404, 'not_found', 'Checklist not found.');
      return;
    }
    if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
      apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
      return;
    }
    const item = await db.updateChecklistItem(req.params.itemId, req.body);
    if (!item) {
      apiError(res, 404, 'not_found', 'Checklist item not found.');
      return;
    }
    res.json({ item });
  }
);

/** DELETE /api/checklists/:id/items/:itemId */
router.delete('/:id/items/:itemId', requireAuth, async (req: AuthRequest, res) => {
  const list = await db.findChecklistById(req.params.id);
  if (!list) {
    apiError(res, 404, 'not_found', 'Checklist not found.');
    return;
  }
  if (req.user!.role !== 'ADMIN' && list.userId !== req.user!.userId) {
    apiError(res, 403, 'forbidden', 'You can only access your own checklists.');
    return;
  }
  await db.deleteChecklistItem(req.params.itemId);
  res.json({ ok: true });
});

export default router;
