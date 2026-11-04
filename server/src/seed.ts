/**
 * Seed script for demonstration data.
 *
 * Uses the comprehensive rules dataset from src/data/rulesData.ts.
 * All rules marked reviewStatus = 'ILLUSTRATIVE' are demo data and NOT current law.
 */

import { db } from './db';
import bcrypt from 'bcryptjs';
import {
  INVESTMENT_CATEGORIES,
  buildComprehensiveRules,
  REGULATORY_SOURCES,
  REGULATORY_UPDATES,
} from './data/rulesData';

async function main() {
  await db.$connect();

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nrisimplifier.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'AdminChangeMe123!';
  const existingAdmin = await db.findUserByEmail(adminEmail);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.createUser({
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'ADMIN',
      emailVerified: true,
    });
    // eslint-disable-next-line no-console
    console.log(`[seed] Created admin user: ${adminEmail}`);
  } else {
    // eslint-disable-next-line no-console
    console.log(`[seed] Admin user already exists: ${adminEmail}`);
  }

  // Regulatory sources
  for (const s of REGULATORY_SOURCES) {
    const exists = (await db.listRegulatorySources()).find((x: { url: string }) => x.url === s.url);
    if (!exists) await db.createRegulatorySource(s);
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Seeded ${REGULATORY_SOURCES.length} regulatory sources.`);

  // Investment categories
  const categoryMap = new Map<string, string>();
  for (const c of INVESTMENT_CATEGORIES) {
    const existing = await db.findInvestmentCategoryBySlug(c.slug);
    if (!existing) {
      const created = await db.createInvestmentCategory(c);
      categoryMap.set(c.slug, created.id);
    } else {
      categoryMap.set(c.slug, existing.id);
    }
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Ensured ${INVESTMENT_CATEGORIES.length} investment categories.`);

  // Eligibility rules (comprehensive)
  const rules = buildComprehensiveRules(categoryMap);
  for (const r of rules) {
    const existing = await db.findEligibilityRuleByRuleId(r.ruleId);
    if (!existing) {
      await db.createEligibilityRule({
        ...r,
        effectiveDate: r.effectiveDate ? new Date(r.effectiveDate) : undefined,
        lastVerified: r.lastVerified ? new Date(r.lastVerified) : undefined,
      });
    }
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Ensured ${rules.length} eligibility rules.`);

  // Regulatory updates
  for (const u of REGULATORY_UPDATES) {
    await db.createRegulatoryUpdate(u);
  }
  // eslint-disable-next-line no-console
  console.log(`[seed] Seeded ${REGULATORY_UPDATES.length} regulatory updates.`);

  await db.$disconnect();
  // eslint-disable-next-line no-console
  console.log('[seed] Done.');
}

async function seedDemoData(): Promise<void> {
  await db.$connect();

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@nrisimplifier.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'AdminChangeMe123!';
  const existingAdmin = await db.findUserByEmail(adminEmail);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.createUser({
      email: adminEmail,
      passwordHash,
      name: 'Administrator',
      role: 'ADMIN',
      emailVerified: true,
    });
  }

  for (const s of REGULATORY_SOURCES) {
    const exists = (await db.listRegulatorySources()).find((x: { url: string }) => x.url === s.url);
    if (!exists) await db.createRegulatorySource(s);
  }

  const categoryMap = new Map<string, string>();
  for (const c of INVESTMENT_CATEGORIES) {
    const existing = await db.findInvestmentCategoryBySlug(c.slug);
    if (!existing) {
      const created = await db.createInvestmentCategory(c);
      categoryMap.set(c.slug, created.id);
    } else {
      categoryMap.set(c.slug, existing.id);
    }
  }

  const rules = buildComprehensiveRules(categoryMap);
  for (const r of rules) {
    const existing = await db.findEligibilityRuleByRuleId(r.ruleId);
    if (!existing) {
      await db.createEligibilityRule({
        ...r,
        effectiveDate: r.effectiveDate ? new Date(r.effectiveDate) : undefined,
        lastVerified: r.lastVerified ? new Date(r.lastVerified) : undefined,
      });
    }
  }

  for (const u of REGULATORY_UPDATES) {
    await db.createRegulatoryUpdate(u);
  }

  await db.$disconnect();
}

export { seedDemoData };

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  process.exit(1);
});
