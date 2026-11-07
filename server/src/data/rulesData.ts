/**
 * Comprehensive NRI investment eligibility rules dataset.
 *
 * Covers 7 countries of residence x 9 investment categories x NRI/OCI/Other statuses.
 *
 * IMPORTANT: Rules marked reviewStatus = "ILLUSTRATIVE" are demonstration data
 * and NOT current law. They are provided so the platform functions as a demo.
 * Administrators must replace them with verified RBI/SEBI/Income-Tax rules before
 * production use. Verified rules must carry official source URLs and verification dates.
 */

import { StoreEligibilityRule, StoreInvestmentCategory, StoreRegulatorySource } from '../../src/db';

type CategoryInput = Partial<StoreInvestmentCategory> &
  Pick<StoreInvestmentCategory, 'name' | 'slug' | 'description'>;
type SourceInput = Partial<StoreRegulatorySource> &
  Pick<StoreRegulatorySource, 'name' | 'url' | 'type' | 'country'>;

// ---------------------------------------------------------------------------
// Countries supported
// ---------------------------------------------------------------------------
export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Canada',
  'Australia',
  'Singapore',
  'Other',
] as const;

export const RESIDENCY_STATUSES = ['NRI', 'OCI', 'Other / unsure'] as const;

export const INVESTMENT_CATEGORIES: CategoryInput[] = [
  {
    name: 'Indian Mutual Funds',
    slug: 'indian-mutual-funds',
    description: 'Open-ended and close-ended mutual funds registered with SEBI.',
    riskLevel: 'Moderate',
    liquidity: 'High (subject to exit load and NAV)',
    repatriation: 'Depends on NRE (repatriable) vs NRO (non-repatriable) basis',
    taxComplexity: 'Moderate',
    accountRequirements: 'NRE/NRO account + SEBI-registered intermediary KYC',
    officialSources: ['https://www.sebi.gov.in', 'https://www.amfiindia.com'],
  },
  {
    name: 'Listed Indian Equities',
    slug: 'listed-indian-equities',
    description: 'Shares of Indian companies listed on NSE/BSE.',
    riskLevel: 'High',
    liquidity: 'High during market hours',
    repatriation: 'Repatriable via NRE; subject to FEMA/PIS where applicable',
    taxComplexity: 'Moderate-High',
    accountRequirements: 'NRE/NRO account, NRI demat & trading account, PIS (where applicable)',
    officialSources: [
      'https://www.sebi.gov.in',
      'https://www.rbi.org.in',
      'https://www.nseindia.com',
    ],
  },
  {
    name: 'Exchange-Traded Funds (ETFs)',
    slug: 'exchange-traded-funds',
    description: 'Index and commodity ETFs listed on Indian exchanges.',
    riskLevel: 'Moderate-High',
    liquidity: 'High during market hours',
    repatriation: 'Same as listed equities',
    taxComplexity: 'Moderate',
    accountRequirements: 'NRE/NRO account + NRI demat account',
    officialSources: ['https://www.sebi.gov.in', 'https://www.nseindia.com'],
  },
  {
    name: 'IPOs',
    slug: 'ipos',
    description: 'Initial public offerings of Indian companies.',
    riskLevel: 'High',
    liquidity: 'Low until listing',
    repatriation: 'Subject to FEMA and allotment terms',
    taxComplexity: 'Moderate',
    accountRequirements: 'NRE/NRO account + NRI demat account',
    officialSources: ['https://www.sebi.gov.in'],
  },
  {
    name: 'Government Securities and Bonds',
    slug: 'government-securities-bonds',
    description: 'Indian government bonds and securities.',
    riskLevel: 'Low-Moderate',
    liquidity: 'Moderate',
    repatriation: 'Varies by instrument and route',
    taxComplexity: 'Moderate',
    accountRequirements: 'NRE/NRO account + demat account (where held in demat)',
    officialSources: ['https://www.rbi.org.in', 'https://www.sebi.gov.in'],
  },
  {
    name: 'Fixed Deposits',
    slug: 'fixed-deposits',
    description: 'NRE/NRO/FCNR fixed deposits with Indian banks.',
    riskLevel: 'Low',
    liquidity: 'Moderate (premature withdrawal penalties may apply)',
    repatriation: 'NRE/FCNR repatriable; NRO subject to limits',
    taxComplexity: 'Low-Moderate',
    accountRequirements: 'NRE/NRO/FCNR bank account',
    officialSources: ['https://www.rbi.org.in'],
  },
  {
    name: 'Real Estate',
    slug: 'real-estate',
    description: 'Residential and commercial immovable property in India.',
    riskLevel: 'Moderate-High',
    liquidity: 'Low',
    repatriation: 'Restricted; subject to FEMA and source-of-funds rules',
    taxComplexity: 'High',
    accountRequirements: 'NRO account for sale proceeds; RBI approvals may apply',
    officialSources: ['https://www.rbi.org.in'],
  },
  {
    name: 'REITs and InvITs',
    slug: 'reits-invits',
    description: 'Real Estate Investment Trusts and Infrastructure Investment Trusts.',
    riskLevel: 'Moderate-High',
    liquidity: 'Moderate (exchange-listed)',
    repatriation: 'Varies by structure',
    taxComplexity: 'High',
    accountRequirements: 'NRE/NRO account + NRI demat account',
    officialSources: ['https://www.sebi.gov.in'],
  },
  {
    name: 'GIFT City Investment Products',
    slug: 'gift-city-products',
    description: 'IFSC-regulated investment products at GIFT City.',
    riskLevel: 'Moderate-High',
    liquidity: 'Varies by product',
    repatriation: 'Subject to IFSC and FEMA rules',
    taxComplexity: 'High',
    accountRequirements: 'IFSC-compliant account + intermediary KYC',
    officialSources: ['https://www.sebi.gov.in', 'https://www.ifscindia.com'],
  },
];

// ---------------------------------------------------------------------------
// Rule builder helpers
// ---------------------------------------------------------------------------

type RuleOverride = Partial<StoreEligibilityRule>;

function rule(overrides: RuleOverride): StoreEligibilityRule {
  return {
    ruleId: overrides.ruleId!,
    categoryId: overrides.categoryId ?? '',
    jurisdiction: overrides.jurisdiction!,
    investorCategory: overrides.investorCategory!,
    conditions: overrides.conditions!,
    outcome: overrides.outcome!,
    explanation: overrides.explanation!,
    conditionsDetail: overrides.conditionsDetail ?? null,
    exceptions: overrides.exceptions ?? null,
    accountType: overrides.accountType ?? null,
    documentation: overrides.documentation ?? null,
    repatriation: overrides.repatriation ?? null,
    taxConsiderations: overrides.taxConsiderations ?? null,
    sourceUrl: overrides.sourceUrl ?? null,
    sourceName: overrides.sourceName ?? null,
    effectiveDate: overrides.effectiveDate ?? null,
    lastVerified: overrides.lastVerified ?? null,
    reviewStatus: overrides.reviewStatus ?? 'ILLUSTRATIVE',
    version: overrides.version ?? 1,
    isActive: overrides.isActive ?? true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as StoreEligibilityRule;
}

function cond(key: string, operator: string, value: any) {
  return { key, operator, value };
}

const SEBI = { sourceUrl: 'https://www.sebi.gov.in', sourceName: 'SEBI' };
const RBI = { sourceUrl: 'https://www.rbi.org.in', sourceName: 'RBI (FEMA)' };
const ITD = {
  sourceUrl: 'https://www.incometaxindia.gov.in',
  sourceName: 'Income Tax Department, India',
};
const MOF = { sourceUrl: 'https://www.finmin.gov.in', sourceName: 'Ministry of Finance, India' };

const ILL = 'ILLUSTRATIVE';
const VER = 'VERIFIED';
const PEN = 'PENDING';

export function buildComprehensiveRules(categoryMap: Map<string, string>): StoreEligibilityRule[] {
  const rules: StoreEligibilityRule[] = [];

  const add = (catSlug: string, overrides: RuleOverride) => {
    const catId = categoryMap.get(catSlug);
    if (!catId) {
      throw new Error(`Unknown category slug: ${catSlug}`);
    }
    rules.push(rule({ ...overrides, categoryId: catId }));
  };

  // =========================================================================
  // INDIAN MUTUAL FUNDS
  // =========================================================================
  const mfBase = {
    conditionsDetail:
      'Applies to SEBI-registered mutual funds. Fund-house onboarding policies vary by country.',
    accountType: 'NRE or NRO account',
    documentation: 'PAN, passport, overseas address proof, KYC',
    repatriation: 'Repatriable if invested on an NRE basis; NRO proceeds subject to limits',
    taxConsiderations:
      'Indian capital-gains tax may apply; TDS may be deducted on redemption. Tax in country of residence should be verified separately.',
  };

  add('indian-mutual-funds', {
    ruleId: 'MF-US-001',
    jurisdiction: 'United States',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United States'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'U.S.-based NRIs may generally invest in Indian mutual funds through an NRE or NRO account. Some fund houses apply additional FATCA/CRS documentation for U.S. persons and may restrict certain schemes.',
    exceptions:
      'Certain fund houses may decline U.S. persons under FATCA-related policies; confirm with the fund house.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-US-OCI-001',
    jurisdiction: 'United States',
    investorCategory: 'OCI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United States'),
      cond('investorCategory', 'eq', 'OCI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'U.S.-based OCI cardholders are generally treated similarly to NRIs for Indian mutual fund investment, subject to fund-house and KYC requirements.',
    exceptions: 'FATCA/CRS documentation may be required; some fund houses restrict U.S. persons.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-UK-001',
    jurisdiction: 'United Kingdom',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United Kingdom'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'UK-based NRIs may generally invest in Indian mutual funds through NRE/NRO accounts.',
    exceptions: 'Some fund houses may have country-specific onboarding policies.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-AE-001',
    jurisdiction: 'United Arab Emirates',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United Arab Emirates'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'UAE-based NRIs may generally invest in Indian mutual funds through NRE/NRO accounts.',
    exceptions: 'Fund-house onboarding policies vary.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-CA-001',
    jurisdiction: 'Canada',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Canada'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'Canadian-resident NRIs may invest in Indian mutual funds, but some fund houses apply additional due diligence for Canadian residents under CRS; verification with the fund house is recommended.',
    exceptions: 'Some fund houses restrict Canadian residents; confirm scheme-by-scheme.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-AU-001',
    jurisdiction: 'Australia',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Australia'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'Australia-based NRIs may generally invest in Indian mutual funds through NRE/NRO accounts.',
    exceptions: 'Fund-house policies vary.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-SG-001',
    jurisdiction: 'Singapore',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Singapore'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'Singapore-based NRIs may generally invest in Indian mutual funds through NRE/NRO accounts.',
    exceptions: 'Fund-house policies vary.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-OTHER-001',
    jurisdiction: 'Other',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Other'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'INSUFFICIENT_INFO',
    explanation:
      'For countries not explicitly covered, eligibility cannot be determined from the rules on file. Confirm with the fund house and your bank.',
    exceptions: 'None — treat as insufficient information.',
    ...mfBase,
    ...SEBI,
    reviewStatus: PEN,
  });
  add('indian-mutual-funds', {
    ruleId: 'MF-OCI-ANY-001',
    jurisdiction: '*',
    investorCategory: 'OCI',
    conditions: [
      cond('investorCategory', 'eq', 'OCI'),
      cond('category', 'eq', 'Indian Mutual Funds'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'OCI cardholders are generally treated similarly to NRIs for Indian mutual fund investment, subject to fund-house and KYC requirements.',
    exceptions: 'Fund-house onboarding policies vary by country.',
    ...mfBase,
    ...SEBI,
    reviewStatus: ILL,
  });

  // =========================================================================
  // LISTED INDIAN EQUITIES
  // =========================================================================
  const eqBase = {
    conditionsDetail:
      'Applies to NSE/BSE-listed equities. PIS (Portfolio Investment Scheme) approval may be required for repatriable investments.',
    accountType: 'NRE (repatriable) or NRO (non-repatriable) + NRI demat & trading account',
    documentation:
      'PAN, PIS permission letter (where applicable), passport, overseas address proof, FATCA declaration',
    repatriation: 'Repatriable via NRE/PIS route; non-repatriable via NRO',
    taxConsiderations:
      'Capital-gains tax in India may apply; TDS may apply on sale. Tax in country of residence may also apply.',
  };

  add('listed-indian-equities', {
    ruleId: 'EQ-US-001',
    jurisdiction: 'United States',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United States'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'U.S.-based NRIs can invest in listed Indian equities through an NRI demat and trading account. PIS approval and additional disclosures may apply; confirmation with a SEBI-registered broker is required.',
    exceptions: 'PIS requirements and broker onboarding policies vary.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-UK-001',
    jurisdiction: 'United Kingdom',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United Kingdom'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'UK-based NRIs may invest in listed Indian equities through an NRI demat and trading account. PIS may apply for repatriable investments.',
    exceptions: 'Broker onboarding policies vary.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-AE-001',
    jurisdiction: 'United Arab Emirates',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'United Arab Emirates'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'UAE-based NRIs may invest in listed Indian equities through an NRI demat and trading account.',
    exceptions: 'Broker onboarding policies vary.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-CA-001',
    jurisdiction: 'Canada',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Canada'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'Canadian-resident NRIs may invest in listed Indian equities, subject to broker due diligence and CRS; verification with a SEBI-registered broker is required.',
    exceptions: 'Some brokers may restrict Canadian residents.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-AU-001',
    jurisdiction: 'Australia',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Australia'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'Australia-based NRIs may invest in listed Indian equities through an NRI demat and trading account.',
    exceptions: 'Broker policies vary.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-SG-001',
    jurisdiction: 'Singapore',
    investorCategory: 'NRI',
    conditions: [
      cond('countryOfResidence', 'eq', 'Singapore'),
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'Singapore-based NRIs may invest in listed Indian equities through an NRI demat and trading account.',
    exceptions: 'Broker policies vary.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-OTHER-RESTRICTED-001',
    jurisdiction: '*',
    investorCategory: 'OTHER',
    conditions: [
      cond('investorCategory', 'eq', 'OTHER'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'POTENTIAL_RESTRICTION',
    explanation:
      'Investors who are neither NRI nor OCI may face restrictions on directly investing in listed Indian equities. Eligibility is uncertain and requires verification.',
    exceptions: 'None — treat as potentially restricted.',
    accountType: 'Case-specific',
    documentation: 'Case-specific documentation',
    repatriation: 'Case-specific',
    taxConsiderations: 'Case-specific',
    ...RBI,
    reviewStatus: ILL,
  });
  add('listed-indian-equities', {
    ruleId: 'EQ-OCI-ANY-001',
    jurisdiction: '*',
    investorCategory: 'OCI',
    conditions: [
      cond('investorCategory', 'eq', 'OCI'),
      cond('category', 'eq', 'Listed Indian Equities'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'OCI cardholders are generally treated similarly to NRIs for listed Indian equity investment, subject to demat and PIS requirements.',
    exceptions: 'PIS and broker policies vary by country.',
    ...eqBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });

  // =========================================================================
  // EXCHANGE-TRADED FUNDS
  // =========================================================================
  const etfBase = {
    conditionsDetail: 'Applies to index and commodity ETFs listed on Indian exchanges.',
    accountType: 'NRE/NRO account + NRI demat account',
    documentation:
      'PAN, passport, overseas address proof, KYC, FATCA declaration (where applicable)',
    repatriation: 'Same as listed equities — depends on NRE/NRO basis',
    taxComplexity: 'Moderate',
  };

  for (const c of [
    'United States',
    'United Kingdom',
    'United Arab Emirates',
    'Canada',
    'Australia',
    'Singapore',
  ]) {
    const isUS = c === 'United States';
    const isCA = c === 'Canada';
    add('exchange-traded-funds', {
      ruleId: `ETF-${c.replace(/ /g, '')}-001`,
      jurisdiction: c,
      investorCategory: 'NRI',
      conditions: [
        cond('countryOfResidence', 'eq', c),
        cond('investorCategory', 'eq', 'NRI'),
        cond('category', 'eq', 'Exchange-Traded Funds (ETFs)'),
      ],
      outcome: isUS || isCA ? 'VERIFICATION_REQUIRED' : 'POTENTIALLY_ELIGIBLE',
      explanation: `${c}-based NRIs may generally invest in Indian ETFs through an NRI demat and trading account.${isUS || isCA ? ' Additional due diligence may apply; broker verification recommended.' : ''}`,
      exceptions: 'Broker onboarding policies vary.',
      ...etfBase,
      ...SEBI,
      ...RBI,
      reviewStatus: ILL,
    });
  }
  add('exchange-traded-funds', {
    ruleId: 'ETF-OCI-ANY-001',
    jurisdiction: '*',
    investorCategory: 'OCI',
    conditions: [
      cond('investorCategory', 'eq', 'OCI'),
      cond('category', 'eq', 'Exchange-Traded Funds (ETFs)'),
    ],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'OCI cardholders may generally invest in Indian ETFs through an NRI demat and trading account.',
    exceptions: 'Broker policies vary by country.',
    ...etfBase,
    ...SEBI,
    ...RBI,
    reviewStatus: ILL,
  });

  // =========================================================================
  // IPOs
  // =========================================================================
  const ipoBase = {
    conditionsDetail: 'Applies to initial public offerings of Indian companies.',
    accountType: 'NRE/NRO account + NRI demat account',
    documentation: 'PAN, passport, overseas address proof, KYC, ASBA/UPI mandate where applicable',
    repatriation: 'Subject to FEMA and allotment terms',
    taxConsiderations: 'Capital-gains tax on listing gains may apply; TDS may apply.',
  };
  for (const c of COUNTRIES) {
    const isUS = c === 'United States';
    const isCA = c === 'Canada';
    add('ipos', {
      ruleId: `IPO-${c.replace(/ /g, '')}-001`,
      jurisdiction: c,
      investorCategory: 'NRI',
      conditions: [
        cond('countryOfResidence', 'eq', c),
        cond('investorCategory', 'eq', 'NRI'),
        cond('category', 'eq', 'IPOs'),
      ],
      outcome:
        isUS || isCA || c === 'Other'
          ? c === 'Other'
            ? 'INSUFFICIENT_INFO'
            : 'VERIFICATION_REQUIRED'
          : 'POTENTIALLY_ELIGIBLE',
      explanation: `${c}-based NRIs may apply for Indian IPOs through an NRE/NRO demat account using ASBA.${isUS || isCA ? ' Additional verification with the broker/intermediary is recommended.' : c === 'Other' ? ' Eligibility cannot be determined from rules on file.' : ''}`,
      exceptions: 'Some issuers/intermediaries may have country-specific restrictions.',
      ...ipoBase,
      ...SEBI,
      reviewStatus: ILL,
    });
  }

  // =========================================================================
  // GOVERNMENT SECURITIES AND BONDS
  // =========================================================================
  const gsecBase = {
    conditionsDetail:
      'Applies to Indian government bonds and securities (including Sovereign Gold Bonds where eligible).',
    accountType: 'NRE/NRO account + demat account (where held in demat)',
    documentation: 'PAN, passport, overseas address proof, KYC',
    repatriation: 'Varies by instrument and route under FEMA',
    taxConsiderations:
      'Interest income is taxable in India; capital-gains rules depend on instrument and holding period.',
  };
  for (const c of COUNTRIES) {
    add('government-securities-bonds', {
      ruleId: `GSEC-${c.replace(/ /g, '')}-001`,
      jurisdiction: c,
      investorCategory: 'NRI',
      conditions: [
        cond('countryOfResidence', 'eq', c),
        cond('investorCategory', 'eq', 'NRI'),
        cond('category', 'eq', 'Government Securities and Bonds'),
      ],
      outcome: c === 'Other' ? 'INSUFFICIENT_INFO' : 'POTENTIALLY_ELIGIBLE',
      explanation: `${c}-based NRIs may generally invest in Indian government securities subject to FEMA and RBI limits.`,
      exceptions:
        'Certain instruments (e.g., Sovereign Gold Bonds) may not be available to NRIs; verify instrument-specific eligibility.',
      ...gsecBase,
      ...RBI,
      ...SEBI,
      reviewStatus: ILL,
    });
  }

  // =========================================================================
  // FIXED DEPOSITS
  // =========================================================================
  const fdBase = {
    conditionsDetail: 'Applies to NRE, NRO, and FCNR fixed deposits with Indian banks.',
    accountType: 'NRE, NRO, or FCNR account',
    documentation: 'PAN, passport, overseas address proof, KYC',
    repatriation: 'NRE/FCNR deposits are repatriable; NRO deposits subject to repatriation limits',
    taxConsiderations:
      'NRE interest is generally tax-exempt in India; NRO interest is taxable and may be subject to TDS.',
  };
  for (const c of COUNTRIES) {
    add('fixed-deposits', {
      ruleId: `FD-${c.replace(/ /g, '')}-001`,
      jurisdiction: c,
      investorCategory: 'NRI',
      conditions: [
        cond('countryOfResidence', 'eq', c),
        cond('investorCategory', 'eq', 'NRI'),
        cond('category', 'eq', 'Fixed Deposits'),
      ],
      outcome: 'POTENTIALLY_ELIGIBLE',
      explanation: `${c}-based NRIs may generally open NRE, NRO, or FCNR fixed deposits with Indian banks, subject to the bank's KYC and documentation requirements.`,
      exceptions: 'Bank-specific policies and minimum deposit amounts apply.',
      ...fdBase,
      ...RBI,
      reviewStatus: ILL,
    });
  }
  add('fixed-deposits', {
    ruleId: 'FD-OCI-ANY-001',
    jurisdiction: '*',
    investorCategory: 'OCI',
    conditions: [cond('investorCategory', 'eq', 'OCI'), cond('category', 'eq', 'Fixed Deposits')],
    outcome: 'POTENTIALLY_ELIGIBLE',
    explanation:
      'OCI cardholders may generally open NRE, NRO, or FCNR fixed deposits with Indian banks.',
    exceptions: 'Bank-specific policies apply.',
    ...fdBase,
    ...RBI,
    reviewStatus: ILL,
  });

  // =========================================================================
  // REAL ESTATE
  // =========================================================================
  const reBase = {
    conditionsDetail:
      'Applies to residential and commercial immovable property in India. Agricultural land, plantation property, and farmhouses are generally restricted.',
    accountType: 'NRO account typically used for sale proceeds',
    documentation:
      'PAN, passport, OCI card (if applicable), address proof, sale agreement, bank certificates',
    repatriation: 'Repatriation of sale proceeds is subject to FEMA limits and documentation',
    taxConsiderations:
      'Capital-gains tax and TDS on sale of property by NRI may apply; verify with a tax professional.',
  };
  add('real-estate', {
    ruleId: 'RE-ANY-001',
    jurisdiction: '*',
    investorCategory: 'NRI',
    conditions: [cond('investorCategory', 'eq', 'NRI'), cond('category', 'eq', 'Real Estate')],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'NRIs may generally purchase residential and commercial property in India, but purchase of agricultural land, plantation property, or a farmhouse is restricted. Sale proceeds repatriation is subject to FEMA conditions.',
    exceptions: 'Agricultural land/plantation/farmhouse generally not permitted for NRI purchase.',
    ...reBase,
    ...RBI,
    reviewStatus: ILL,
  });
  add('real-estate', {
    ruleId: 'RE-OCI-001',
    jurisdiction: '*',
    investorCategory: 'OCI',
    conditions: [cond('investorCategory', 'eq', 'OCI'), cond('category', 'eq', 'Real Estate')],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'OCI cardholders may generally purchase residential and commercial property in India, subject to similar restrictions on agricultural land.',
    exceptions: 'Agricultural land/plantation/farmhouse generally not permitted.',
    ...reBase,
    ...RBI,
    reviewStatus: ILL,
  });

  // =========================================================================
  // REITS AND INVITS
  // =========================================================================
  const reitBase = {
    conditionsDetail:
      'Applies to SEBI-registered Real Estate Investment Trusts and Infrastructure Investment Trusts listed on Indian exchanges.',
    accountType: 'NRE/NRO account + NRI demat account',
    documentation: 'PAN, passport, overseas address proof, KYC, demat account details',
    repatriation: 'Varies by structure; depends on NRE/NRO basis',
    taxConsiderations:
      'Tax treatment of REIT/InvIT distributions and capital gains can be complex; verify with a tax professional.',
  };
  for (const c of COUNTRIES) {
    add('reits-invits', {
      ruleId: `REIT-${c.replace(/ /g, '')}-001`,
      jurisdiction: c,
      investorCategory: 'NRI',
      conditions: [
        cond('countryOfResidence', 'eq', c),
        cond('investorCategory', 'eq', 'NRI'),
        cond('category', 'eq', 'REITs and InvITs'),
      ],
      outcome: c === 'Other' ? 'INSUFFICIENT_INFO' : 'POTENTIALLY_ELIGIBLE',
      explanation: `${c}-based NRIs may generally invest in SEBI-registered REITs and InvITs through an NRI demat and trading account.`,
      exceptions: 'Trust-specific eligibility and broker policies vary.',
      ...reitBase,
      ...SEBI,
      reviewStatus: ILL,
    });
  }

  // =========================================================================
  // GIFT CITY
  // =========================================================================
  const gftBase = {
    conditionsDetail:
      'Applies to IFSC-regulated investment products at GIFT City (Gujarat International Finance Tec-City).',
    accountType: 'IFSC-compliant account + intermediary KYC',
    documentation: 'KYC as per IFSC-regulated intermediary, passport, address proof',
    repatriation: 'Subject to IFSC and FEMA rules',
    taxConsiderations:
      'Tax treatment of IFSC products may differ from domestic investments; verify with a tax professional.',
  };
  add('gift-city-products', {
    ruleId: 'GFT-ANY-001',
    jurisdiction: '*',
    investorCategory: 'NRI',
    conditions: [
      cond('investorCategory', 'eq', 'NRI'),
      cond('category', 'eq', 'GIFT City Investment Products'),
    ],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'GIFT City IFSC products are regulated separately from domestic Indian investments. Eligibility, KYC, and repatriation depend on the specific product and IFSC framework.',
    exceptions: 'Product-specific eligibility varies.',
    ...gftBase,
    ...SEBI,
    reviewStatus: ILL,
  });
  add('gift-city-products', {
    ruleId: 'GFT-OCI-001',
    jurisdiction: '*',
    investorCategory: 'OCI',
    conditions: [
      cond('investorCategory', 'eq', 'OCI'),
      cond('category', 'eq', 'GIFT City Investment Products'),
    ],
    outcome: 'VERIFICATION_REQUIRED',
    explanation:
      'OCI cardholders may invest in GIFT City IFSC products subject to IFSC framework and product-specific eligibility.',
    exceptions: 'Product-specific eligibility varies.',
    ...gftBase,
    ...SEBI,
    reviewStatus: ILL,
  });

  return rules;
}

export const REGULATORY_SOURCES: SourceInput[] = [
  {
    name: 'Reserve Bank of India (RBI)',
    url: 'https://www.rbi.org.in',
    type: 'RBI',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'Securities and Exchange Board of India (SEBI)',
    url: 'https://www.sebi.gov.in',
    type: 'SEBI',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'Income Tax Department, India',
    url: 'https://www.incometaxindia.gov.in',
    type: 'Income Tax',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'Ministry of Finance, India',
    url: 'https://www.finmin.gov.in',
    type: 'Ministry of Finance',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'National Stock Exchange of India (NSE)',
    url: 'https://www.nseindia.com',
    type: 'Stock Exchange',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'BSE Limited',
    url: 'https://www.bseindia.com',
    type: 'Stock Exchange',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'AMFI (Association of Mutual Funds in India)',
    url: 'https://www.amfiindia.com',
    type: 'Industry Body',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'GIFT City IFSC Authority',
    url: 'https://www.ifscindia.com',
    type: 'IFSC Authority',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'NSDL',
    url: 'https://www.nsdl.co.in',
    type: 'Depository',
    country: 'India',
    isReliable: true,
  },
  {
    name: 'CDSL',
    url: 'https://www.cdslindia.com',
    type: 'Depository',
    country: 'India',
    isReliable: true,
  },
];

export const REGULATORY_UPDATES = [
  {
    title: 'Demo platform launched — illustrative regulatory data',
    summary:
      'This demonstration version uses illustrative eligibility rules marked as "ILLUSTRATIVE." They are not current law. Administrators should replace them with verified RBI/SEBI rules before production use.',
    sourceUrl: null,
    isActive: true,
  },
  {
    title: 'Comprehensive country×category rules added',
    summary:
      'Eligibility rules now cover United States, United Kingdom, UAE, Canada, Australia, Singapore, and Other across all nine investment categories. Rules marked ILLUSTRATIVE remain demonstration data.',
    sourceUrl: null,
    isActive: true,
  },
];
