/**
 * Educational tax and repatriation estimator.
 *
 * All figures are illustrative estimates only. This module uses a versioned,
 * in-memory rules dataset and never presents an estimate as a definitive tax
 * liability. It does not invent treaty benefits or rates; where reliable
 * inputs are missing, the result is marked unavailable.
 */

export type TaxInput = {
  investmentType: string;
  investmentAmount: number; // INR, illustrative
  purchaseValue: number; // INR
  saleValue: number; // INR
  holdingPeriodYears: number;
  countryOfTaxResidence?: string;
  expenses?: number; // INR, applicable expenses/taxes already paid
  knownTdsRate?: number; // % withholding tax in India, if known
};

export type TaxEstimate = {
  version: string;
  available: boolean;
  gainOrLoss: number;
  gainPercent: number;
  indianTaxConsiderations: string;
  withholdingTaxConsiderations: string;
  foreignTaxImplications: string;
  repatriationQuestions: string[];
  assumptions: string[];
  limitations: string[];
  illustrativeIndianTaxInr?: number;
  illustrativeEffectiveRate?: number;
};

const VERSION = '1.0.0-illustrative';

/**
 * Very limited, versioned illustrative reference points. These are NOT tax
 * advice and are included only so the calculator can produce an illustrative
 * figure. Users must verify current rates with the Income Tax Department of
 * India and their country of residence.
 */
const ILLUSTRATIVE_REFERENCE = {
  note: 'Illustrative only — verify current rates before relying on any figure.',
  ltcgEquityInrLakhExemption: 125000, // INR, illustrative LTCG exemption (equity)
  ltcgEquityRatePercent: 10, // above exemption, illustrative
  sttcgEquityRatePercent: 15, // illustrative
  debtLtcgRatePercent: 20, // with indexation, illustrative (pre-change reference)
  nroInterestTdsPercent: 30, // indicative TDS on NRO interest, illustrative
  nreInterestTaxIndiaPercent: 0, // NRE interest generally tax-exempt in India, illustrative
};

export function estimateTax(input: TaxInput): TaxEstimate {
  const assumptions: string[] = [];
  const limitations: string[] = [];
  const repatriationQuestions: string[] = [];

  const gainOrLoss = input.saleValue - input.purchaseValue - (input.expenses ?? 0);
  const gainPercent = input.purchaseValue > 0 ? (gainOrLoss / input.purchaseValue) * 100 : 0;

  limitations.push('This is an educational illustration, not a tax computation or liability.');
  limitations.push('Rates and rules shown are illustrative versioned references and may not reflect current law.');
  limitations.push('Double Taxation Avoidance Agreement (DTAA) benefits, if any, are not computed.');
  limitations.push('Tax treatment in your country of tax residence is not calculated here.');
  limitations.push('SEBI/RBI/FEMA investment eligibility is separate from tax treatment and is not assessed here.');
  limitations.push('We do not store or report this data to any tax authority.');

  assumptions.push(`Investment type: ${input.investmentType}.`);
  assumptions.push(`Holding period: ${input.holdingPeriodYears} year(s).`);
  assumptions.push(`Amounts are in INR and illustrative.`);
  if (input.countryOfTaxResidence) assumptions.push(`Country of tax residence declared: ${input.countryOfTaxResidence}.`);

  // --- Indian tax considerations (illustrative, equity vs debt split) ---
  const isEquity = /equity|share|stock|mutual fund|etf|ipo/i.test(input.investmentType);
  const isDebt = /deposit|bond|debenture|debt/i.test(input.investmentType);
  const isLongTerm = isEquity ? input.holdingPeriodYears > 1 : input.holdingPeriodYears > 3;

  let indianTaxConsiderations = '';
  let illustrativeIndianTaxInr: number | undefined;
  let illustrativeEffectiveRate: number | undefined;

  if (gainOrLoss <= 0) {
    indianTaxConsiderations = 'No illustrative capital gain arises (a loss or break-even position). Indian capital-gains tax would not apply on a loss, though losses may be subject to set-off/carry-forward rules under the Income Tax Act that you should verify with a tax professional.';
  } else if (isEquity) {
    const exemption = ILLUSTRATIVE_REFERENCE.ltcgEquityInrLakhExemption;
    const rate = isLongTerm ? ILLUSTRATIVE_REFERENCE.ltcgEquityRatePercent : ILLUSTRATIVE_REFERENCE.sttcgEquityRatePercent;
    const taxable = isLongTerm ? Math.max(0, gainOrLoss - exemption) : gainOrLoss;
    illustrativeIndianTaxInr = taxable * (rate / 100);
    illustrativeEffectiveRate = (illustrativeIndianTaxInr / gainOrLoss) * 100;
    indianTaxConsiderations = `Illustrative: ${isLongTerm ? 'long-term' : 'short-term'} capital gains on equity. ` +
      `For long-term gains above an illustrative exemption of ₹${exemption.toLocaleString()}, tax is approximately ${rate}% (plus applicable cess/surcharge). ` +
      `Short-term gains are taxed at approximately ${rate}%. These are illustrative figures — confirm current rates with the Income Tax Department of India.`;
  } else if (isDebt) {
    const rate = isLongTerm ? ILLUSTRATIVE_REFERENCE.debtLtcgRatePercent : null;
    if (rate) {
      illustrativeIndianTaxInr = gainOrLoss * (rate / 100);
      illustrativeEffectiveRate = (illustrativeIndianTaxInr / gainOrLoss) * 100;
      indianTaxConsiderations = `Illustrative: long-term capital gains on a debt instrument taxed at approximately ${rate}% (with indexation benefits historically applicable; rules have changed — verify current treatment). Short-term debt gains are taxed at applicable slab rates.`;
    } else {
      indianTaxConsiderations = 'Short-term debt gains are taxed at applicable income-tax slab rates; verify current rates and holding-period classifications with a tax professional.';
    }
  } else {
    indianTaxConsiderations = 'The investment category was not recognized as equity or debt. Indian tax treatment cannot be illustrated reliably without a recognized category and current rules.';
  }

  // --- Withholding tax (TDS) considerations ---
  let withholdingTaxConsiderations = '';
  if (input.knownTdsRate) {
    const tds = gainOrLoss > 0 ? gainOrLoss * (input.knownTdsRate / 100) : 0;
    withholdingTaxConsiderations = `You indicated an India withholding (TDS) rate of ${input.knownTdsRate}%. Illustrative TDS on the gain: ₹${tds.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Confirm whether TDS applies to your investment route and whether a lower DTAA rate is available.`;
  } else if (/deposit|nro|interest/i.test(input.investmentType)) {
    withholdingTaxConsiderations = 'Interest or gains routed through an NRO account may be subject to TDS in India (commonly around 30% illustrative on NRO interest, subject to DTAA). NRE-based investment proceeds are generally not subject to TDS on interest in India, but capital-gains rules may still apply. Confirm with your bank.';
  } else {
    withholdingTaxConsiderations = 'No withholding rate was provided. If tax is deducted at source in India, you may be able to claim a credit in your country of residence under a DTAA — verify with a tax professional.';
  }

  repatriationQuestions.push('Will redemption/sale proceeds be credited to an NRE or NRO account?');
  repatriationQuestions.push('Is the investment on a repatriable or non-repatriable basis under FEMA?');
  repatriationQuestions.push('What documentation (bank certificate, Form 15CA/15CB where applicable) will your bank require for outward remittance?');

  // --- Foreign tax implications ---
  let foreignTaxImplications = '';
  if (input.countryOfTaxResidence) {
    foreignTaxImplications = `You declared ${input.countryOfTaxResidence} as your country of tax residence. That country may tax your worldwide income, including Indian investment gains, and may offer a foreign tax credit for tax paid in India (subject to a DTAA between India and ${input.countryOfTaxResidence}, if one exists). We do not compute foreign tax liability — consult a tax adviser in ${input.countryOfTaxResidence}.`;
  } else {
    foreignTaxImplications = 'No country of tax residence was provided, so foreign tax implications cannot be assessed.';
  }

  const available = true; // calculation runs, but marked illustrative

  return {
    version: VERSION,
    available,
    gainOrLoss,
    gainPercent,
    indianTaxConsiderations,
    withholdingTaxConsiderations,
    foreignTaxImplications,
    repatriationQuestions,
    assumptions,
    limitations,
    ...(illustrativeIndianTaxInr !== undefined ? { illustrativeIndianTaxInr } : {}),
    ...(illustrativeEffectiveRate !== undefined ? { illustrativeEffectiveRate } : {}),
  };
}

export { VERSION };
