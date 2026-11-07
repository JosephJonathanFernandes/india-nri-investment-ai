import { Router } from 'express';
import { z } from 'zod';
import { estimateTax, VERSION } from '../services/taxEstimator';
import { validate } from '../middleware/validation';
import { optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const estimateSchema = z.object({
  investmentType: z.string().min(1, 'Investment type is required'),
  investmentAmount: z.number().nonnegative('Investment amount must be non-negative'),
  purchaseValue: z.number().nonnegative('Purchase value must be non-negative'),
  saleValue: z.number().nonnegative('Sale value must be non-negative'),
  holdingPeriodYears: z.number().nonnegative('Holding period must be non-negative'),
  countryOfTaxResidence: z.string().optional(),
  expenses: z.number().nonnegative().optional(),
  knownTdsRate: z.number().min(0).max(100).optional(),
});

/** POST /api/tax/estimate */
router.post('/estimate', optionalAuth, validate(estimateSchema), async (req: AuthRequest, res) => {
  const input = req.body as z.infer<typeof estimateSchema>;
  const estimate = estimateTax(input);
  res.json({ estimate, version: VERSION });
});

export default router;
