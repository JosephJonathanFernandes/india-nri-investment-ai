export type EligibilityOutcome =
  | 'POTENTIALLY_ELIGIBLE'
  | 'POTENTIAL_RESTRICTION'
  | 'VERIFICATION_REQUIRED'
  | 'INSUFFICIENT_INFO'
  | 'UNRESOLVED';

export interface EligibilityResult {
  id: string;
  ruleId?: string;
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
  effectiveDate?: string | null;
  lastVerified?: string | null;
  reviewStatus: string;
  version: number;
  isIllustrative: boolean;
}

export interface EligibilityCheck {
  id: string;
  categoryId?: string | null;
  countryOfResidence: string;
  residencyStatus: string;
  investmentAmount?: string | null;
  repatriationPreference?: string | null;
  overallOutcome: string;
  summary?: string | null;
  createdAt: string;
  results?: EligibilityResult[];
}

export interface InvestmentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  riskLevel?: string | null;
  liquidity?: string | null;
  repatriation?: string | null;
  taxComplexity?: string | null;
  accountRequirements?: string | null;
  officialSources: string[];
  isActive: boolean;
}

export interface UserProfile {
  countryOfResidence: string;
  residencyStatus: string;
  investmentObjectives: string[];
  riskPreference: string;
  investmentAmountRange: string;
  repatriationPreference: string;
  existingBanking: string[];
  completedOnboarding: boolean;
}
