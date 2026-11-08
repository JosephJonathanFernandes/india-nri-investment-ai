import { Router } from 'express';
import { z } from 'zod';
import {
  db,
  type StoreEligibilityCheck,
  type StoreEligibilityResult,
  type StoreInvestmentCategory,
} from '../db';
import {
  evaluateEligibility,
  type EligibilityInput,
  OUTCOME_LABELS,
} from '../services/eligibilityEngine';
import { validate, apiError } from '../middleware/validation';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const checkSchema = z.object({
  category: z.string().min(1, 'Investment category is required'),
  investmentAmount: z.string().optional(),
  repatriationPreference: z.string().optional(),
});

/** POST /api/eligibility/check */
router.post('/check', optionalAuth, validate(checkSchema), async (req: AuthRequest, res) => {
  const profile = await (req.user ? db.findUserProfileByUserId(req.user.userId) : null);

  const countryOfResidence = profile?.countryOfResidence || req.body.countryOfResidence || '';
  const residencyStatus = profile?.residencyStatus || req.body.residencyStatus || '';

  if (!countryOfResidence || !residencyStatus) {
    apiError(
      res,
      400,
      'profile_incomplete',
      'Complete your onboarding profile before running an eligibility check.'
    );
    return;
  }

  const input: EligibilityInput = {
    countryOfResidence,
    residencyStatus,
    category: req.body.category,
    investmentAmount: req.body.investmentAmount ?? undefined,
    repatriationPreference:
      req.body.repatriationPreference ?? profile?.repatriationPreference ?? undefined,
    existingBanking: profile?.existingBanking ?? [],
  };

  const result = await evaluateEligibility(input);

  // Persist check + results (for authenticated users only).
  let checkId: string | null = null;
  if (req.user) {
    const categories = await db.listInvestmentCategories(true);
    const category = categories.find(
      (c: StoreInvestmentCategory) =>
        c.name.toLowerCase() === input.category.toLowerCase() || c.slug === input.category
    );
    const check = await db.createEligibilityCheck({
      userId: req.user.userId,
      categoryId: category?.id ?? null,
      countryOfResidence: input.countryOfResidence,
      residencyStatus: input.residencyStatus,
      investmentAmount: input.investmentAmount ? String(input.investmentAmount) : null,
      repatriationPreference: input.repatriationPreference ?? null,
      overallOutcome: result.overallOutcome,
      summary: result.summary,
    });
    checkId = check.id;

    for (const rule of result.rules) {
      await db.createEligibilityResult({
        checkId,
        ruleId: rule.ruleId || undefined,
        category: rule.category,
        outcome: rule.outcome,
        explanation: rule.explanation,
        conditions: rule.conditions ?? undefined,
        exceptions: rule.exceptions ?? undefined,
        accountType: rule.accountType ?? undefined,
        documentation: rule.documentation ?? undefined,
        repatriation: rule.repatriation ?? undefined,
        taxConsiderations: rule.taxConsiderations ?? undefined,
        sourceUrl: rule.sourceUrl ?? undefined,
        sourceName: rule.sourceName ?? undefined,
        effectiveFrom: rule.effectiveFrom ?? undefined,
        effectiveTo: rule.effectiveTo ?? undefined,
        lastVerified: rule.lastVerified ?? undefined,
        status: rule.status,
        version: rule.version,
        isIllustrative: rule.isIllustrative,
      });
    }
  }

  res.json({
    checkId,
    overallOutcome: result.overallOutcome,
    overallLabel: OUTCOME_LABELS[result.overallOutcome] ?? result.overallOutcome,
    unresolved: result.unresolved,
    summary: result.summary,
    results: result.rules.map((r) => ({
      ruleId: r.ruleId,
      category: r.category,
      outcome: r.outcome,
      label: OUTCOME_LABELS[r.outcome] ?? r.outcome,
      explanation: r.explanation,
      conditions: r.conditions,
      exceptions: r.exceptions,
      accountType: r.accountType,
      documentation: r.documentation,
      repatriation: r.repatriation,
      taxConsiderations: r.taxConsiderations,
      sourceUrl: r.sourceUrl,
      sourceName: r.sourceName,
      effectiveFrom: r.effectiveFrom,
      effectiveTo: r.effectiveTo,
      lastVerified: r.lastVerified,
      status: r.status,
      version: r.version,
      isIllustrative: r.isIllustrative,
      matchReasons: r.matchReasons,
    })),
  });
});

/** GET /api/eligibility/history */
router.get('/history', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.user!.userId;
  const checks = await db.listEligibilityChecksByUser(userId);

  const enriched = await Promise.all(
    checks.map(async (check: StoreEligibilityCheck) => {
      const results = await db.listEligibilityResultsByCheck(check.id);
      return {
        id: check.id,
        categoryId: check.categoryId,
        countryOfResidence: check.countryOfResidence,
        residencyStatus: check.residencyStatus,
        investmentAmount: check.investmentAmount,
        repatriationPreference: check.repatriationPreference,
        overallOutcome: check.overallOutcome,
        summary: check.summary,
        createdAt: check.createdAt,
        resultsCount: results.length,
        results: results.map((r: StoreEligibilityResult) => ({
          id: r.id,
          category: r.category,
          outcome: r.outcome,
          explanation: r.explanation,
          conditions: r.conditions,
          exceptions: r.exceptions,
          accountType: r.accountType,
          documentation: r.documentation,
          repatriation: r.repatriation,
          taxConsiderations: r.taxConsiderations,
          sourceUrl: r.sourceUrl,
          sourceName: r.sourceName,
          effectiveFrom: r.effectiveFrom,
          effectiveTo: r.effectiveTo,
          lastVerified: r.lastVerified,
          status: r.status,
          version: r.version,
          isIllustrative: r.isIllustrative,
        })),
      };
    })
  );

  res.json({ checks: enriched });
});

export default router;
