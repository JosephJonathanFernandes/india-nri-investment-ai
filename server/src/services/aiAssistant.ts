/**
 * AI Regulatory Assistant for NRI investment questions.
 *
 * Uses OpenAI when OPENAI_API_KEY is configured; otherwise falls back to a
 * deterministic, source-cited mock assistant so the demo remains functional.
 * All answers clearly separate regulatory eligibility from tax advice and
 * recommend consulting a qualified professional for complex cases.
 */

import { config } from '../config';
import { db, type StoreRegulatorySource } from '../db';
import { OpenAI } from 'openai';

let openai: OpenAI | null = null;
function getOpenAI(): OpenAI | null {
  if (!config.openaiApiKey) return null;
  if (!openai) openai = new OpenAI({ apiKey: config.openaiApiKey });
  return openai;
}

const DISCLAIMER =
  '\n\n---\n*This is educational guidance, not legal, tax, or investment advice. '
  + 'Regulatory eligibility and tax treatment can change and depend on your '
  + 'specific circumstances. Please consult a qualified financial adviser, '
  + 'tax professional, or the relevant authority (RBI, SEBI, Income Tax '
  + 'Department, or your country of residence\u2019s tax authority) before making '
  + 'investment decisions.*';

const SYSTEM_PROMPT = `You are the NRI Investment Assistant for the "NRI Investment Simplifier" platform.
You help Non-Resident Indians understand Indian investment eligibility, account types (NRE/NRO/FCNR),
repatriation rules, and related tax considerations in plain language.

Core rules:
1. Never claim an investment is legally permitted based solely on your output.
2. Always separate regulatory eligibility (RBI/SEBI/Indian rules) from tax advice (India + country of residence).
3. Cite reliable sources whenever available (RBI, SEBI, Income Tax Department of India, Ministry of Finance, official exchanges, official tax authority of the user's country of residence).
4. Do not fabricate laws, regulations, URLs, or citations. If you are not certain, say so.
5. Ask clarifying questions when important details are missing (country of residence, NRI/OCI status, investment category, repatriation need).
6. Use the user's onboarding profile when provided.
7. Clearly communicate uncertainty and recommend consulting a qualified professional for complex cases.
8. Never guarantee investment returns, tax savings, or repatriation.
9. If reliable source retrieval is unavailable, state that the answer requires verification rather than inventing an authoritative response.

Keep responses concise, clear, and educational.`;

/**
 * Retrieve potentially relevant regulatory sources from the database for RAG.
 */
async function retrieveSources(query: string, limit = 5): Promise<StoreRegulatorySource[]> {
  const sources = await db.listRegulatorySources();
  const q = query.toLowerCase();
  interface ScoredSource { s: StoreRegulatorySource; score: number }
  const scored = sources
    .filter((s: StoreRegulatorySource) => s.isReliable)
    .map((s: StoreRegulatorySource): ScoredSource => {
      let score = 0;
      const text = `${s.name} ${s.type} ${s.country}`.toLowerCase();
      for (const term of ['rbi', 'sebi', 'income tax', 'finance', 'mutual fund', 'equity', 'nre', 'nro', 'repatriation', 'gift city', 'bond', 'deposit']) {
        if (q.includes(term) && text.includes(term)) score += 1;
      }
      return { s, score };
    })
    .filter((x: ScoredSource) => x.score > 0)
    .sort((a: ScoredSource, b: ScoredSource) => b.score - a.score)
    .slice(0, limit)
    .map((x: ScoredSource) => x.s);
  return scored;
}

function sourcesText(sources: Array<StoreRegulatorySource>): string {
  if (sources.length === 0) return '';
  const lines = sources.map((s: StoreRegulatorySource) => `- ${s.name} (${s.type}, ${s.country})${s.url ? `: ${s.url}` : ''}`);
  return 'Relevant official sources:\n' + lines.join('\n') + '\n';
}

/**
 * Deterministic mock assistant used when OpenAI is unavailable.
 */
function mockAnswer(question: string, profile: any, sources: StoreRegulatorySource[]): { answer: string; sources: string[] } {
  const q = question.toLowerCase();
  let answer = '';
  const srcUrls: string[] = [];

  const mutualFund = q.includes('mutual fund');
  const nreNro = q.includes('nre') || q.includes('nro') || q.includes('difference');
  const repatriate = q.includes('repatriat') || q.includes('proceeds');
  const documents = q.includes('document') || q.includes('kyc') || q.includes('broker');
  const giftCity = q.includes('gift city');
  const country = profile?.countryOfResidence || 'your country of residence';
  const status = profile?.residencyStatus || 'NRI/OCI';

  if (mutualFund) {
    answer = `Indian mutual funds are generally available to NRIs and OCIs, but eligibility depends on your country of residence (${country}) and the asset manager's policies. Many fund houses accept NRI investors through an NRE or NRO account linked to an NRI-compatible demat/trading account. Some fund houses restrict investors from certain countries (for example, under FATCA-related considerations for U.S. persons), so you should confirm with the fund house or a SEBI-registered intermediary before investing. Repatriation of redemption proceeds depends on whether the investment was made on a repatriable (NRE) or non-repatriable (NRO) basis.`;
    srcUrls.push('https://www.sebi.gov.in', 'https://www.rbi.org.in');
  } else if (nreNro) {
    answer = `NRE (Non-Resident External) and NRO (Non-Resident Ordinary) accounts serve different purposes:
- NRE account: holds foreign earnings remitted to India; funds are freely repatriable; interest is generally tax-free in India.
- NRO account: holds income earned in India (rent, dividends, pension); repatriation is subject to limits and taxes; interest is taxable in India.
FCNR deposits are foreign-currency term deposits that are also repatriable.
Which account is appropriate depends on the source of funds and whether you need to repatriate proceeds.`;
    srcUrls.push('https://www.rbi.org.in');
  } else if (repatriate) {
    answer = `Repatriation of investment proceeds depends on the account type and investment route:
- Investments made through an NRE account (repatriable basis) can generally be repatriated, subject to FEMA and bank documentation.
- Investments made through an NRO account are generally non-repatriable beyond permitted limits and are subject to tax withholding in India.
You should verify the exact limits and required documentation with your bank and a tax adviser before investing.`;
    srcUrls.push('https://www.rbi.org.in', 'https://www.incometaxindia.gov.in');
  } else if (documents) {
    answer = `A broker or mutual fund distributor may ask an NRI for:
- PAN card
- Passport copy and overseas address proof
- KYC documents (KYC registration agency / SEBI-registered intermediary KYC)
- NRE or NRO bank account details (cancelled cheque or bank certificate)
- FATCA / CRS declaration (especially for U.S. persons and other CRS countries)
- Broker-specific account opening forms and possibly a PIS permission letter (for equity, where applicable)
Requirements vary by broker, investment category, and country of residence. Confirm the exact list with your chosen intermediary.`;
    srcUrls.push('https://www.sebi.gov.in', 'https://www.nsdl.co.in', 'https://www.cdslindia.com');
  } else if (giftCity) {
    answer = `GIFT City (Gujarat International Finance Tec-City) offers investment products through IFSC-regulated entities. NRIs may invest through designated channels, but eligibility, KYC, account, and repatriation rules differ from domestic Indian investments and depend on the specific product and the IFSC Authority framework. You should verify product-specific rules with the GIFT City IFSC unit or a SEBI/IFSC-registered intermediary before investing.`;
    srcUrls.push('https://www.sebi.gov.in', 'https://www.ifscindia.com');
  } else {
    answer = `I can help with questions about NRI investment eligibility in India, NRE/NRO/FCNR accounts, repatriation rules, and documents brokers may require. To give you a more specific answer, please tell me:
1. Your country of residence,
2. Your residency status (NRI, OCI, or other),
3. The investment category you're considering (for example, mutual funds, listed equities, fixed deposits, bonds, real estate, REITs/InvITs, or GIFT City products),
4. Whether you need to repatriate proceeds.

For example: "Can I invest in Indian mutual funds while living in the USA?"`;
  }

  answer += sourcesText(sources) + DISCLAIMER;
  return { answer, sources: srcUrls };
}

/**
 * Generate an answer using OpenAI with RAG context, or the mock fallback.
 */
export async function answerQuestion(
  question: string,
  profile: any,
  conversationId?: string
): Promise<{ answer: string; sources: string[] }> {
  const sources = await retrieveSources(question);

  const ai = getOpenAI();
  if (ai) {
    try {
      const contextSources = sourcesText(sources);
      const profileText = profile
        ? `\nUser profile: country of residence = ${profile.countryOfResidence}, residency status = ${profile.residencyStatus}.\n`
        : '\nNo user profile available.\n';

      const completion = await ai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'system', content: contextSources + profileText },
          { role: 'user', content: question },
        ],
      });

      const content = completion.choices[0]?.message?.content ?? '';
      const answer = content.trim() + DISCLAIMER;
      return { answer, sources: sources.map((s) => s.url).filter(Boolean) as string[] };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[aiAssistant] OpenAI request failed, using mock fallback:', (err as Error).message);
    }
  }

  const fallback = mockAnswer(question, profile, sources);
  return fallback;
}
