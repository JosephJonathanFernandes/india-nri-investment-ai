/**
 * Deterministic eligibility rules engine.
 *
 * Evaluates stored EligibilityRule records against a user's profile and an
 * investment category. Rules are versioned, carry explicit conditions, and
 * never silently override one another: conflicting outcomes for the same
 * input produce an unresolved result flagged for manual review.
 *
 * All logic is deterministic and separate from AI-generated text and tax
 * calculations.
 */

import { db, type StoreEligibilityRule, type StoreInvestmentCategory } from '../db';

export type EligibilityOutcome =
  | 'POTENTIALLY_ELIGIBLE'
  | 'POTENTIAL_RESTRICTION'
  | 'VERIFICATION_REQUIRED'
  | 'INSUFFICIENT_INFO'
  | 'UNRESOLVED';

export interface EligibilityInput {
  countryOfResidence: string;
  residencyStatus: string; // NRI | OCI | OTHER
  category: string; // category name or slug
  investmentAmount?: number | string;
  repatriationPreference?: string;
  existingBanking?: string[];
}

export interface MatchedRule {
  ruleId: string;
  category: string;
  outcome: EligibilityOutcome;
  explanation: string;
  conditions?: string | null;
  exceptions?: string | null;
  accountType?: string | null;
  documentation?: string | null;
  repatriation?: string | null;
  taxConsiderations?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  lastVerified?: Date | null;
  status: string;
  version: number;
  isIllustrative: boolean;
  matched: boolean;
  matchReasons: string[];
}

/**
 * Normalize a raw stored outcome into one of our public outcome categories.
 */
function normalizeOutcome(raw: string): EligibilityOutcome {
  const r = String(raw).toUpperCase();
  if (r.includes('ELIGIBLE') && !r.includes('RESTRICT')) return 'POTENTIALLY_ELIGIBLE';
  if (r.includes('RESTRICT') || r.includes('PROHIBIT')) return 'POTENTIAL_RESTRICTION';
  if (r.includes('VERIFICATION') || r.includes('REQUIRED')) return 'VERIFICATION_REQUIRED';
  if (r.includes('INSUFFICIENT') || r.includes('UNKNOWN')) return 'INSUFFICIENT_INFO';
  return 'INSUFFICIENT_INFO';
}

/**
 * Check whether a single condition clause is satisfied by the input.
 */
function conditionMet(condition: any, input: EligibilityInput): { met: boolean; reason: string } {
  const key = String(condition.key ?? condition.field ?? '');
  const op = String(condition.operator ?? 'eq');
  const value = condition.value;
  const negated = condition.not === true;

  let met = false;
  let reason = `${key} ${op} ${JSON.stringify(value)}`;

  switch (key) {
    case 'jurisdiction':
    case 'countryOfResidence':
      met = matchList(input.countryOfResidence, value, op);
      reason = `country of residence is "${input.countryOfResidence}"`;
      break;
    case 'residencyStatus':
    case 'investorCategory':
      met = matchList(input.residencyStatus, value, op);
      reason = `residency status is "${input.residencyStatus}"`;
      break;
    case 'category':
    case 'investmentCategory':
      met = matchList(input.category, value, op);
      reason = `investment category is "${input.category}"`;
      break;
    case 'repatriationPreference':
      met = matchList(input.repatriationPreference ?? '', value, op);
      reason = `repatriation preference is "${input.repatriationPreference ?? 'unspecified'}"`;
      break;
    case 'investmentAmount': {
      const amt = parseAmount(input.investmentAmount);
      const val = parseAmount(value);
      if (amt === null || val === null) {
        met = false;
        reason = 'investment amount could not be compared';
      } else {
        met = compareNumbers(amt, op, val);
        reason = `investment amount ${formatAmount(amt)} ${op} ${formatAmount(val)}`;
      }
      break;
    }
    case 'requiresAccount':
    case 'accountTypes':
    case 'existingBanking': {
      const banking = input.existingBanking ?? [];
      const required = Array.isArray(value) ? value : [value];
      met = required.some((v: any) => banking.includes(String(v)));
      reason = `existing banking includes ${JSON.stringify(required)}`;
      break;
    }
    case 'excludedCountries':
    case 'restrictedCountries': {
      const excluded = Array.isArray(value) ? value : [value];
      met = !excluded.includes(input.countryOfResidence);
      reason = `country not in restricted list`;
      break;
    }
    case 'repatriationAllowed':
      met = Boolean(value) === (input.repatriationPreference ? true : false);
      reason = `repatriation preference stated`;
      break;
    case 'minHoldingPeriod':
    case 'maxHoldingPeriod':
      // No holding period in input; treat as not determinable.
      met = false;
      reason = 'holding period not provided';
      break;
    default:
      // Unknown condition key: cannot evaluate deterministically.
      met = false;
      reason = `condition "${key}" could not be evaluated`;
      break;
  }

  if (negated) met = !met;
  return { met, reason };
}

function matchList(inputValue: string, conditionValue: any, op: string): boolean {
  const list = Array.isArray(conditionValue) ? conditionValue : [conditionValue];
  const normalized = list.map((v) => String(v).toLowerCase().trim());
  const input = inputValue.toLowerCase().trim();
  if (op === 'not_in' || op === '!=') return !normalized.includes(input);
  return normalized.includes(input);
}

function compareNumbers(a: number, op: string, b: number): boolean {
  switch (op) {
    case 'eq':
    case '=':
      return a === b;
    case 'ne':
    case '!=':
      return a !== b;
    case 'gt':
    case '>':
      return a > b;
    case 'gte':
    case '>=':
      return a >= b;
    case 'lt':
    case '<':
      return a < b;
    case 'lte':
    case '<=':
      return a <= b;
    case 'between':
      return a >= b && a <= b; // b treated as lower; upper not supported here
    default:
      return false;
  }
}

function parseAmount(value: any): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function formatAmount(n: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

/**
 * Evaluate rules for an input. Returns matched rules and an overall outcome.
 */
export async function evaluateEligibility(input: EligibilityInput): Promise<{
  overallOutcome: EligibilityOutcome;
  summary: string;
  rules: MatchedRule[];
  unresolved: boolean;
}> {
  const categories = await db.listInvestmentCategories(true);
  let category = categories.find(
    (c: StoreInvestmentCategory) =>
      c.name.toLowerCase() === input.category.toLowerCase() || c.slug === input.category
  );
  if (!category) {
    category = categories.find(
      (c: StoreInvestmentCategory) => c.slug === input.category.toLowerCase()
    );
  }

  const now = new Date();
  const allRules = await db.listEligibilityRules({ isActive: true, status: 'PUBLISHED' });

  // Filter rules relevant to this category + jurisdiction + investor category.
  const relevant = allRules.filter((r: StoreEligibilityRule) => {
    if (category && r.categoryId !== category.id) return false;
    // jurisdiction match: exact or wildcard '*'
    if (
      r.jurisdiction &&
      r.jurisdiction !== '*' &&
      r.jurisdiction.toLowerCase() !== input.countryOfResidence.toLowerCase()
    ) {
      return false;
    }
    // investor category match: exact or wildcard 'ANY'
    if (
      r.investorCategory &&
      r.investorCategory !== 'ANY' &&
      r.investorCategory.toLowerCase() !== input.residencyStatus.toLowerCase()
    ) {
      return false;
    }
    // effective date range check
    if (r.effectiveFrom && r.effectiveFrom > now) return false;
    if (r.effectiveTo && r.effectiveTo < now) return false;
    return true;
  });

  const matched: MatchedRule[] = [];

  for (const rule of relevant) {
    const conditions: any[] = Array.isArray(rule.conditions) ? rule.conditions : [rule.conditions];
    const matchReasons: string[] = [];
    let allMet = true;
    let anyMet = false;

    if (conditions.length === 0) {
      // No conditions: rule applies broadly.
      allMet = true;
      anyMet = true;
    } else {
      for (const cond of conditions) {
        const r = conditionMet(cond, input);
        matchReasons.push(`${r.met ? 'MATCH' : 'NO-MATCH'}: ${r.reason}`);
        if (r.met) anyMet = true;
        else allMet = false;
      }
    }

    // A rule matches if all its conditions are met (AND semantics within a rule).
    if (allMet && (conditions.length > 0 || anyMet)) {
      matched.push({
        ruleId: rule.ruleId,
        category: category ? category.name : input.category,
        outcome: normalizeOutcome(rule.outcome),
        explanation: rule.explanation,
        conditions: rule.conditionsDetail ?? null,
        exceptions: rule.exceptions ?? null,
        accountType: rule.accountType ?? null,
        documentation: rule.documentation ?? null,
        repatriation: rule.repatriation ?? null,
        taxConsiderations: rule.taxConsiderations ?? null,
        sourceUrl: rule.sourceUrl ?? null,
        sourceName: rule.sourceName ?? null,
        effectiveFrom: rule.effectiveFrom ?? null,
        effectiveTo: rule.effectiveTo ?? null,
        lastVerified: rule.lastVerified ?? null,
        status: rule.status,
        version: rule.version,
        isIllustrative: rule.status === 'DRAFT',
        matched: true,
        matchReasons,
      });
    }
  }

  const overall = computeOverallOutcome(matched);
  return {
    overallOutcome: overall.outcome,
    summary: overall.summary,
    rules: matched,
    unresolved: overall.unresolved,
  };
}

/**
 * Combine multiple matched rule outcomes into a single overall outcome.
 *
 * Conflict policy: if matching rules disagree on the outcome category, the
 * result is UNRESOLVED (manual review) rather than arbitrarily picking one.
 */
function computeOverallOutcome(rules: MatchedRule[]): {
  outcome: EligibilityOutcome;
  summary: string;
  unresolved: boolean;
} {
  if (rules.length === 0) {
    return {
      outcome: 'INSUFFICIENT_INFO',
      summary:
        'No applicable eligibility rules were found for your profile and the selected investment. This does not mean the investment is restricted — it means we cannot determine eligibility from the rules currently on file.',
      unresolved: false,
    };
  }

  const outcomes = [...new Set(rules.map((r) => r.outcome))];
  const hasRestriction = rules.some((r) => r.outcome === 'POTENTIAL_RESTRICTION');
  const hasVerification = rules.some((r) => r.outcome === 'VERIFICATION_REQUIRED');
  let outcome: EligibilityOutcome;
  let unresolved = false;
  let summary: string;

  if (outcomes.length === 1) {
    outcome = outcomes[0];
    unresolved = false;
    switch (outcome) {
      case 'POTENTIALLY_ELIGIBLE':
        summary =
          'General rules suggest this investment may be available to you, subject to the conditions and account requirements listed below.';
        break;
      case 'POTENTIAL_RESTRICTION':
        summary =
          'A relevant rule or country-specific limitation may apply. Please review the restriction details and confirm with an authorized financial institution before proceeding.';
        break;
      case 'VERIFICATION_REQUIRED':
        summary =
          'More information or confirmation from an authorized financial institution is necessary before eligibility can be determined.';
        break;
      case 'INSUFFICIENT_INFO':
        summary =
          'The available rules do not provide enough information to determine eligibility reliably.';
        break;
      default:
        summary = 'Eligibility could not be determined from the available rules.';
    }
  } else {
    // Conflicting outcomes -> unresolved for manual review.
    unresolved = true;
    outcome = 'UNRESOLVED';
    if (hasRestriction) {
      summary =
        'Matching rules give conflicting guidance, including a possible country-specific restriction. This case requires manual review by our compliance team before any investment decision.';
    } else if (hasVerification) {
      summary =
        'Matching rules give conflicting guidance. Additional verification from an authorized financial institution is required.';
    } else {
      summary =
        'Matching rules give conflicting guidance. This case has been flagged for manual review.';
    }
  }

  return { outcome, summary, unresolved: unresolved };
}

export const OUTCOME_LABELS: Record<EligibilityOutcome, string> = {
  POTENTIALLY_ELIGIBLE: 'Potentially eligible',
  POTENTIAL_RESTRICTION: 'Potential restriction',
  VERIFICATION_REQUIRED: 'Additional verification required',
  INSUFFICIENT_INFO: 'Insufficient information',
  UNRESOLVED: 'Unresolved — manual review',
};

export const OUTCOME_VARIANT: Record<EligibilityOutcome, string> = {
  POTENTIALLY_ELIGIBLE: 'eligible',
  POTENTIAL_RESTRICTION: 'restriction',
  VERIFICATION_REQUIRED: 'verification',
  INSUFFICIENT_INFO: 'insufficient',
  UNRESOLVED: 'unresolved',
};
