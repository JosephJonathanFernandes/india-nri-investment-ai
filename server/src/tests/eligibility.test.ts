import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { memory, db, usePrisma } from '../db';
import { evaluateEligibility } from '../services/eligibilityEngine';
import { seedDemoData } from '../seed';

describe('eligibility engine', () => {
  beforeAll(async () => {
    await seedDemoData();
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('US NRI + mutual funds is potentially eligible and illustrative', async () => {
    const res = await evaluateEligibility({
      countryOfResidence: 'United States',
      residencyStatus: 'NRI',
      category: 'Indian Mutual Funds',
    });
    expect(res.overallOutcome).toBe('POTENTIALLY_ELIGIBLE');
    expect(res.rules.length).toBeGreaterThan(0);
    expect(res.rules[0].isIllustrative).toBe(true);
    expect(res.unresolved).toBe(false);
  });

  it('US OTHER + listed equities is a potential restriction', async () => {
    const res = await evaluateEligibility({
      countryOfResidence: 'United States',
      residencyStatus: 'OTHER',
      category: 'Listed Indian Equities',
    });
    expect(res.overallOutcome).toBe('POTENTIAL_RESTRICTION');
  });

  it('Canada NRI + mutual funds requires verification', async () => {
    const res = await evaluateEligibility({
      countryOfResidence: 'Canada',
      residencyStatus: 'NRI',
      category: 'Indian Mutual Funds',
    });
    expect(res.overallOutcome).toBe('VERIFICATION_REQUIRED');
  });

  it('unsupported country + mutual funds is insufficient info', async () => {
    const res = await evaluateEligibility({
      countryOfResidence: 'France',
      residencyStatus: 'NRI',
      category: 'Indian Mutual Funds',
    });
    expect(res.overallOutcome).toBe('INSUFFICIENT_INFO');
  });

  it('real estate US NRI requires verification', async () => {
    const res = await evaluateEligibility({
      countryOfResidence: 'United States',
      residencyStatus: 'NRI',
      category: 'Real Estate',
    });
    expect(res.overallOutcome).toBe('VERIFICATION_REQUIRED');
  });

  it('fixed deposits any NRI is potentially eligible', async () => {
    const res = await evaluateEligibility({
      countryOfResidence: 'Singapore',
      residencyStatus: 'NRI',
      category: 'Fixed Deposits',
    });
    expect(res.overallOutcome).toBe('POTENTIALLY_ELIGIBLE');
  });

  it('stores rules with review status and source', async () => {
    const rules = await db.listEligibilityRules({ isActive: true });
    const usRule = rules.find((r) => r.ruleId === 'MF-US-001');
    expect(usRule).toBeDefined();
    expect(usRule.reviewStatus).toBe('ILLUSTRATIVE');
    expect(usRule.sourceUrl).toContain('sebi.gov.in');
  });

  it('in-memory store exposes rules', async () => {
    // usePrisma should be false in test env (no DATABASE_URL)
    expect(usePrisma).toBe(false);
    const rules = await memory.listEligibilityRules({ isActive: true });
    expect(rules.length).toBeGreaterThan(0);
  });
});
