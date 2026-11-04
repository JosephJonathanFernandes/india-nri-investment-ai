import { PrismaClient } from '@prisma/client';

/**
 * Database layer.
 *
 * Attempts to connect to PostgreSQL via Prisma when DATABASE_URL is set and
 * reachable. Falls back to a fully functional in-memory store so the demo
 * runs without any external database. The same `db` interface is used by all
 * routes and services, keeping eligibility rules, auth, and data access
 * independent of the underlying storage.
 */

let prisma: PrismaClient | null = null;
let usePrisma = false;

function createPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

async function tryConnectPrisma(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const p = createPrisma();
    await p.$connect();
    usePrisma = true;
    // eslint-disable-next-line no-console
    console.log('[db] Connected to PostgreSQL via Prisma');
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[db] PostgreSQL unavailable, falling back to in-memory store:', (err as Error).message);
    usePrisma = false;
    return false;
  }
}

// ---------------------------------------------------------------------------
// In-memory store (mirrors the Prisma schema)
// ---------------------------------------------------------------------------

type Json = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function now(): Date {
  return new Date();
}

interface StoreUser {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface StoreUserProfile {
  id: string;
  userId: string;
  countryOfResidence: string;
  residencyStatus: string;
  investmentObjectives: string[];
  riskPreference: string;
  investmentAmountRange: string;
  repatriationPreference: string;
  existingBanking: string[];
  completedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface StoreInvestmentCategory {
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
  createdAt: Date;
  updatedAt: Date;
}
interface StoreEligibilityRule {
  id: string;
  ruleId: string;
  categoryId: string;
  jurisdiction: string;
  investorCategory: string;
  conditions: Json;
  outcome: string;
  explanation: string;
  conditionsDetail?: string | null;
  exceptions?: string | null;
  accountType?: string | null;
  documentation?: string | null;
  repatriation?: string | null;
  taxConsiderations?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  effectiveDate?: Date | null;
  lastVerified?: Date | null;
  reviewStatus: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface StoreRegulatorySource {
  id: string;
  name: string;
  url: string;
  type: string;
  country: string;
  lastChecked?: Date | null;
  isReliable: boolean;
  createdAt: Date;
}
interface StoreEligibilityCheck {
  id: string;
  userId: string;
  categoryId?: string | null;
  countryOfResidence: string;
  residencyStatus: string;
  investmentAmount?: string | null;
  repatriationPreference?: string | null;
  overallOutcome: string;
  summary?: string | null;
  createdAt: Date;
}
interface StoreEligibilityResult {
  id: string;
  checkId: string;
  ruleId?: string | null;
  category: string;
  outcome: string;
  explanation: string;
  conditions?: string | null;
  exceptions?: string | null;
  accountType?: string | null;
  documentation?: string | null;
  repatriation?: string | null;
  taxConsiderations?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  effectiveDate?: Date | null;
  lastVerified?: Date | null;
  reviewStatus: string;
  version: number;
  isIllustrative: boolean;
  createdAt: Date;
}
interface StoreChecklist {
  id: string;
  userId: string;
  title: string;
  category?: string | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
interface StoreChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  description?: string | null;
  isRequired: boolean;
  isConditional: boolean;
  isCompleted: boolean;
  category?: string | null;
  order: number;
  createdAt: Date;
}
interface StoreSavedInvestment {
  id: string;
  userId: string;
  categoryId: string;
  notes?: string | null;
  createdAt: Date;
}
interface StoreRegulatoryUpdate {
  id: string;
  title: string;
  summary: string;
  sourceUrl?: string | null;
  publishedAt: Date;
  isActive: boolean;
}
interface StoreChatConversation {
  id: string;
  userId?: string | null;
  title?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
interface StoreChatMessage {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  sources: string[];
  createdAt: Date;
}

class MemoryDb {
  users = new Map<string, StoreUser>();
  userProfiles = new Map<string, StoreUserProfile>();
  investmentCategories = new Map<string, StoreInvestmentCategory>();
  eligibilityRules = new Map<string, StoreEligibilityRule>();
  regulatorySources = new Map<string, StoreRegulatorySource>();
  eligibilityChecks = new Map<string, StoreEligibilityCheck>();
  eligibilityResults = new Map<string, StoreEligibilityResult>();
  checklists = new Map<string, StoreChecklist>();
  checklistItems = new Map<string, StoreChecklistItem>();
  savedInvestments = new Map<string, StoreSavedInvestment>();
  regulatoryUpdates = new Map<string, StoreRegulatoryUpdate>();
  chatConversations = new Map<string, StoreChatConversation>();
  chatMessages = new Map<string, StoreChatMessage>();

  // ---- User ----
  async createUser(data: Partial<StoreUser>): Promise<StoreUser> {
    const id = data.id || uid();
    const user: StoreUser = {
      id,
      email: data.email!,
      passwordHash: data.passwordHash!,
      name: data.name ?? null,
      role: data.role ?? 'USER',
      emailVerified: data.emailVerified ?? false,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
    };
    this.users.set(id, user);
    return { ...user };
  }
  async findUserByEmail(email: string): Promise<StoreUser | null> {
    const found = [...this.users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
    return found ? { ...found } : null;
  }
  async findUserById(id: string): Promise<StoreUser | null> {
    const found = this.users.get(id);
    return found ? { ...found } : null;
  }
  async updateUser(id: string, data: Partial<StoreUser>): Promise<StoreUser | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated: StoreUser = { ...existing, ...data, updatedAt: now() };
    this.users.set(id, updated);
    return { ...updated };
  }
  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
  async listUsers(): Promise<StoreUser[]> {
    return [...this.users.values()].map((u) => ({ ...u }));
  }

  // ---- UserProfile ----
  async createUserProfile(data: Partial<StoreUserProfile>): Promise<StoreUserProfile> {
    const id = data.id || uid();
    const profile: StoreUserProfile = {
      id,
      userId: data.userId!,
      countryOfResidence: data.countryOfResidence!,
      residencyStatus: data.residencyStatus!,
      investmentObjectives: data.investmentObjectives ?? [],
      riskPreference: data.riskPreference!,
      investmentAmountRange: data.investmentAmountRange!,
      repatriationPreference: data.repatriationPreference!,
      existingBanking: data.existingBanking ?? [],
      completedOnboarding: data.completedOnboarding ?? false,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
    };
    this.userProfiles.set(id, profile);
    return { ...profile };
  }
  async findUserProfileByUserId(userId: string): Promise<StoreUserProfile | null> {
    const found = [...this.userProfiles.values()].find((p) => p.userId === userId);
    return found ? { ...found } : null;
  }
  async updateUserProfile(userId: string, data: Partial<StoreUserProfile>): Promise<StoreUserProfile | null> {
    const existing = await this.findUserProfileByUserId(userId);
    if (!existing) return null;
    const updated: StoreUserProfile = {
      ...existing,
      id: existing.id,
      updatedAt: now(),
      ...(data.countryOfResidence !== undefined ? { countryOfResidence: data.countryOfResidence } : {}),
      ...(data.residencyStatus !== undefined ? { residencyStatus: data.residencyStatus } : {}),
      ...(data.investmentObjectives !== undefined ? { investmentObjectives: data.investmentObjectives } : {}),
      ...(data.riskPreference !== undefined ? { riskPreference: data.riskPreference } : {}),
      ...(data.investmentAmountRange !== undefined ? { investmentAmountRange: data.investmentAmountRange } : {}),
      ...(data.repatriationPreference !== undefined ? { repatriationPreference: data.repatriationPreference } : {}),
      ...(data.existingBanking !== undefined ? { existingBanking: data.existingBanking } : {}),
      ...(data.completedOnboarding !== undefined ? { completedOnboarding: data.completedOnboarding } : {}),
    };
    this.userProfiles.set(existing.id, updated);
    return { ...updated };
  }

  // ---- InvestmentCategory ----
  async createInvestmentCategory(data: Partial<StoreInvestmentCategory>): Promise<StoreInvestmentCategory> {
    const id = data.id || uid();
    const cat: StoreInvestmentCategory = {
      id,
      name: data.name!,
      slug: data.slug!,
      description: data.description ?? null,
      riskLevel: data.riskLevel ?? null,
      liquidity: data.liquidity ?? null,
      repatriation: data.repatriation ?? null,
      taxComplexity: data.taxComplexity ?? null,
      accountRequirements: data.accountRequirements ?? null,
      officialSources: data.officialSources ?? [],
      isActive: data.isActive ?? true,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
    };
    this.investmentCategories.set(id, cat);
    return { ...cat };
  }
  async findInvestmentCategoryById(id: string): Promise<StoreInvestmentCategory | null> {
    const found = this.investmentCategories.get(id);
    return found ? { ...found } : null;
  }
  async findInvestmentCategoryBySlug(slug: string): Promise<StoreInvestmentCategory | null> {
    const found = [...this.investmentCategories.values()].find((c) => c.slug === slug);
    return found ? { ...found } : null;
  }
  async listInvestmentCategories(onlyActive = true): Promise<StoreInvestmentCategory[]> {
    return [...this.investmentCategories.values()]
      .filter((c) => (!onlyActive || c.isActive))
      .map((c) => ({ ...c }));
  }
  async updateInvestmentCategory(id: string, data: Partial<StoreInvestmentCategory>): Promise<StoreInvestmentCategory | null> {
    const existing = this.investmentCategories.get(id);
    if (!existing) return null;
    const updated: StoreInvestmentCategory = { ...existing, ...data, updatedAt: now() };
    this.investmentCategories.set(id, updated);
    return { ...updated };
  }
  async deleteInvestmentCategory(id: string): Promise<boolean> {
    return this.investmentCategories.delete(id);
  }

  // ---- EligibilityRule ----
  async createEligibilityRule(data: Partial<StoreEligibilityRule>): Promise<StoreEligibilityRule> {
    const id = data.id || uid();
    const rule: StoreEligibilityRule = {
      id,
      ruleId: data.ruleId!,
      categoryId: data.categoryId!,
      jurisdiction: data.jurisdiction!,
      investorCategory: data.investorCategory!,
      conditions: data.conditions ?? {},
      outcome: data.outcome!,
      explanation: data.explanation!,
      conditionsDetail: data.conditionsDetail ?? null,
      exceptions: data.exceptions ?? null,
      accountType: data.accountType ?? null,
      documentation: data.documentation ?? null,
      repatriation: data.repatriation ?? null,
      taxConsiderations: data.taxConsiderations ?? null,
      sourceUrl: data.sourceUrl ?? null,
      sourceName: data.sourceName ?? null,
      effectiveDate: data.effectiveDate ?? null,
      lastVerified: data.lastVerified ?? null,
      reviewStatus: data.reviewStatus!,
      version: data.version ?? 1,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
    };
    this.eligibilityRules.set(id, rule);
    return { ...rule };
  }
  async findEligibilityRuleById(id: string): Promise<StoreEligibilityRule | null> {
    const found = this.eligibilityRules.get(id);
    return found ? { ...found } : null;
  }
  async findEligibilityRuleByRuleId(ruleId: string): Promise<StoreEligibilityRule | null> {
    const found = [...this.eligibilityRules.values()].find((r) => r.ruleId === ruleId);
    return found ? { ...found } : null;
  }
  async listEligibilityRules(filter?: {
    categoryId?: string;
    jurisdiction?: string;
    investorCategory?: string;
    isActive?: boolean;
    reviewStatus?: string;
  }): Promise<StoreEligibilityRule[]> {
    let rules = [...this.eligibilityRules.values()];
    if (filter) {
      if (filter.categoryId) rules = rules.filter((r) => r.categoryId === filter.categoryId);
      if (filter.jurisdiction) rules = rules.filter((r) => r.jurisdiction === filter.jurisdiction);
      if (filter.investorCategory) rules = rules.filter((r) => r.investorCategory === filter.investorCategory);
      if (filter.isActive !== undefined) rules = rules.filter((r) => r.isActive === filter.isActive);
      if (filter.reviewStatus) rules = rules.filter((r) => r.reviewStatus === filter.reviewStatus);
    }
    return rules.map((r) => ({
      ...r,
      conditions: Array.isArray(r.conditions)
        ? [...r.conditions]
        : r.conditions && typeof r.conditions === 'object'
          ? { ...r.conditions }
          : r.conditions,
    }));
  }
  async updateEligibilityRule(id: string, data: Partial<StoreEligibilityRule>): Promise<StoreEligibilityRule | null> {
    const existing = this.eligibilityRules.get(id);
    if (!existing) return null;
    const updated: StoreEligibilityRule = { ...existing, ...data, id, updatedAt: now() };
    if (data.conditions && typeof data.conditions === 'object' && !Array.isArray(data.conditions)) {
      updated.conditions = { ...data.conditions };
    }
    this.eligibilityRules.set(id, updated);
    return { ...updated };
  }
  async deleteEligibilityRule(id: string): Promise<boolean> {
    return this.eligibilityRules.delete(id);
  }

  // ---- RegulatorySource ----
  async createRegulatorySource(data: Partial<StoreRegulatorySource>): Promise<StoreRegulatorySource> {
    const id = data.id || uid();
    const src: StoreRegulatorySource = {
      id,
      name: data.name!,
      url: data.url!,
      type: data.type!,
      country: data.country!,
      lastChecked: data.lastChecked ?? null,
      isReliable: data.isReliable ?? true,
      createdAt: data.createdAt ?? now(),
    };
    this.regulatorySources.set(id, src);
    return { ...src };
  }
  async listRegulatorySources(): Promise<StoreRegulatorySource[]> {
    return [...this.regulatorySources.values()].map((s) => ({ ...s }));
  }

  // ---- EligibilityCheck ----
  async createEligibilityCheck(data: Partial<StoreEligibilityCheck>): Promise<StoreEligibilityCheck> {
    const id = data.id || uid();
    const check: StoreEligibilityCheck = {
      id,
      userId: data.userId!,
      categoryId: data.categoryId ?? null,
      countryOfResidence: data.countryOfResidence!,
      residencyStatus: data.residencyStatus!,
      investmentAmount: data.investmentAmount ?? null,
      repatriationPreference: data.repatriationPreference ?? null,
      overallOutcome: data.overallOutcome!,
      summary: data.summary ?? null,
      createdAt: data.createdAt ?? now(),
    };
    this.eligibilityChecks.set(id, check);
    return { ...check };
  }
  async findEligibilityCheckById(id: string): Promise<StoreEligibilityCheck | null> {
    const found = this.eligibilityChecks.get(id);
    return found ? { ...found } : null;
  }
  async listEligibilityChecksByUser(userId: string): Promise<StoreEligibilityCheck[]> {
    return [...this.eligibilityChecks.values()]
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((c) => ({ ...c }));
  }
  async deleteEligibilityCheck(id: string): Promise<boolean> {
    // cascade results
    for (const [rid, r] of this.eligibilityResults) {
      if (r.checkId === id) this.eligibilityResults.delete(rid);
    }
    return this.eligibilityChecks.delete(id);
  }

  // ---- EligibilityResult ----
  async createEligibilityResult(data: Partial<StoreEligibilityResult>): Promise<StoreEligibilityResult> {
    const id = data.id || uid();
    const result: StoreEligibilityResult = {
      id,
      checkId: data.checkId!,
      ruleId: data.ruleId ?? null,
      category: data.category!,
      outcome: data.outcome!,
      explanation: data.explanation!,
      conditions: data.conditions ?? null,
      exceptions: data.exceptions ?? null,
      accountType: data.accountType ?? null,
      documentation: data.documentation ?? null,
      repatriation: data.repatriation ?? null,
      taxConsiderations: data.taxConsiderations ?? null,
      sourceUrl: data.sourceUrl ?? null,
      sourceName: data.sourceName ?? null,
      effectiveDate: data.effectiveDate ?? null,
      lastVerified: data.lastVerified ?? null,
      reviewStatus: data.reviewStatus!,
      version: data.version!,
      isIllustrative: data.isIllustrative ?? false,
      createdAt: data.createdAt ?? now(),
    };
    this.eligibilityResults.set(id, result);
    return { ...result };
  }
  async listEligibilityResultsByCheck(checkId: string): Promise<StoreEligibilityResult[]> {
    return [...this.eligibilityResults.values()]
      .filter((r) => r.checkId === checkId)
      .map((r) => ({ ...r }));
  }

  // ---- Checklist ----
  async createChecklist(data: Partial<StoreChecklist>): Promise<StoreChecklist> {
    const id = data.id || uid();
    const list: StoreChecklist = {
      id,
      userId: data.userId!,
      title: data.title!,
      category: data.category ?? null,
      isCompleted: data.isCompleted ?? false,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
    };
    this.checklists.set(id, list);
    return { ...list };
  }
  async findChecklistById(id: string): Promise<StoreChecklist | null> {
    const found = this.checklists.get(id);
    return found ? { ...found } : null;
  }
  async listChecklistsByUser(userId: string): Promise<StoreChecklist[]> {
    return [...this.checklists.values()]
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((c) => ({ ...c }));
  }
  async updateChecklist(id: string, data: Partial<StoreChecklist>): Promise<StoreChecklist | null> {
    const existing = this.checklists.get(id);
    if (!existing) return null;
    const updated: StoreChecklist = { ...existing, ...data, updatedAt: now() };
    this.checklists.set(id, updated);
    return { ...updated };
  }
  async deleteChecklist(id: string): Promise<boolean> {
    for (const [iid, it] of this.checklistItems) {
      if (it.checklistId === id) this.checklistItems.delete(iid);
    }
    return this.checklists.delete(id);
  }

  // ---- ChecklistItem ----
  async createChecklistItem(data: Partial<StoreChecklistItem>): Promise<StoreChecklistItem> {
    const id = data.id || uid();
    const item: StoreChecklistItem = {
      id,
      checklistId: data.checklistId!,
      title: data.title!,
      description: data.description ?? null,
      isRequired: data.isRequired ?? false,
      isConditional: data.isConditional ?? true,
      isCompleted: data.isCompleted ?? false,
      category: data.category ?? null,
      order: data.order ?? 0,
      createdAt: data.createdAt ?? now(),
    };
    this.checklistItems.set(id, item);
    return { ...item };
  }
  async listChecklistItems(checklistId: string): Promise<StoreChecklistItem[]> {
    return [...this.checklistItems.values()]
      .filter((i) => i.checklistId === checklistId)
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ ...i }));
  }
  async updateChecklistItem(id: string, data: Partial<StoreChecklistItem>): Promise<StoreChecklistItem | null> {
    const existing = this.checklistItems.get(id);
    if (!existing) return null;
    const updated: StoreChecklistItem = { ...existing, ...data, id };
    this.checklistItems.set(id, updated);
    return { ...updated };
  }
  async deleteChecklistItem(id: string): Promise<boolean> {
    return this.checklistItems.delete(id);
  }

  // ---- SavedInvestment ----
  async createSavedInvestment(data: Partial<StoreSavedInvestment>): Promise<StoreSavedInvestment> {
    const id = data.id || uid();
    const saved: StoreSavedInvestment = {
      id,
      userId: data.userId!,
      categoryId: data.categoryId!,
      notes: data.notes ?? null,
      createdAt: data.createdAt ?? now(),
    };
    this.savedInvestments.set(id, saved);
    return { ...saved };
  }
  async listSavedInvestmentsByUser(userId: string): Promise<StoreSavedInvestment[]> {
    return [...this.savedInvestments.values()]
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((s) => ({ ...s }));
  }
  async findSavedInvestmentById(id: string): Promise<StoreSavedInvestment | null> {
    const found = this.savedInvestments.get(id);
    return found ? { ...found } : null;
  }
  async deleteSavedInvestment(id: string): Promise<boolean> {
    return this.savedInvestments.delete(id);
  }

  // ---- RegulatoryUpdate ----
  async createRegulatoryUpdate(data: Partial<StoreRegulatoryUpdate>): Promise<StoreRegulatoryUpdate> {
    const id = data.id || uid();
    const up: StoreRegulatoryUpdate = {
      id,
      title: data.title!,
      summary: data.summary!,
      sourceUrl: data.sourceUrl ?? null,
      publishedAt: data.publishedAt ?? now(),
      isActive: data.isActive ?? true,
    };
    this.regulatoryUpdates.set(id, up);
    return { ...up };
  }
  async listRegulatoryUpdates(onlyActive = true): Promise<StoreRegulatoryUpdate[]> {
    return [...this.regulatoryUpdates.values()]
      .filter((u) => (!onlyActive || u.isActive))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .map((u) => ({ ...u }));
  }

  // ---- ChatConversation ----
  async createChatConversation(data: Partial<StoreChatConversation>): Promise<StoreChatConversation> {
    const id = data.id || uid();
    const conv: StoreChatConversation = {
      id,
      userId: data.userId ?? null,
      title: data.title ?? null,
      createdAt: data.createdAt ?? now(),
      updatedAt: now(),
    };
    this.chatConversations.set(id, conv);
    return { ...conv };
  }
  async findChatConversationById(id: string): Promise<StoreChatConversation | null> {
    const found = this.chatConversations.get(id);
    return found ? { ...found } : null;
  }
  async listChatConversations(userId?: string): Promise<StoreChatConversation[]> {
    return [...this.chatConversations.values()]
      .filter((c) => (userId ? c.userId === userId : true))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .map((c) => ({ ...c }));
  }
  async updateChatConversation(id: string, data: Partial<StoreChatConversation>): Promise<StoreChatConversation | null> {
    const existing = this.chatConversations.get(id);
    if (!existing) return null;
    const updated: StoreChatConversation = { ...existing, ...data, updatedAt: now() };
    this.chatConversations.set(id, updated);
    return { ...updated };
  }

  // ---- ChatMessage ----
  async createChatMessage(data: Partial<StoreChatMessage>): Promise<StoreChatMessage> {
    const id = data.id || uid();
    const msg: StoreChatMessage = {
      id,
      conversationId: data.conversationId!,
      role: data.role!,
      content: data.content!,
      sources: data.sources ?? [],
      createdAt: data.createdAt ?? now(),
    };
    this.chatMessages.set(id, msg);
    return { ...msg };
  }
  async listChatMessages(conversationId: string): Promise<StoreChatMessage[]> {
    return [...this.chatMessages.values()]
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((m) => ({ ...m }));
  }

  async $disconnect(): Promise<void> {
    // no-op for in-memory
  }
}

const memory = new MemoryDb();

// Export store types for route type annotations.
export type {
  StoreUser,
  StoreUserProfile,
  StoreInvestmentCategory,
  StoreEligibilityRule,
  StoreRegulatorySource,
  StoreEligibilityCheck,
  StoreEligibilityResult,
  StoreChecklist,
  StoreChecklistItem,
  StoreSavedInvestment,
  StoreRegulatoryUpdate,
  StoreChatConversation,
  StoreChatMessage,
};

// ---------------------------------------------------------------------------
// Exported `db` — Prisma when available, else in-memory
// ---------------------------------------------------------------------------

export { PrismaClient };
export { memory };
export { usePrisma };

export const db = {
  // User
  createUser: (data: any) => (usePrisma ? createPrisma().user.create({ data }) : memory.createUser(data)),
  findUserByEmail: (email: string) => (usePrisma ? createPrisma().user.findUnique({ where: { email } }) : memory.findUserByEmail(email)),
  findUserById: (id: string) => (usePrisma ? createPrisma().user.findUnique({ where: { id } }) : memory.findUserById(id)),
  updateUser: (id: string, data: any) => (usePrisma ? createPrisma().user.update({ where: { id }, data }) : memory.updateUser(id, data)),
  deleteUser: (id: string) => (usePrisma ? createPrisma().user.delete({ where: { id } }) : memory.deleteUser(id)),
  listUsers: () => (usePrisma ? createPrisma().user.findMany() : memory.listUsers()),

  // UserProfile
  createUserProfile: (data: any) => (usePrisma ? createPrisma().userProfile.create({ data }) : memory.createUserProfile(data)),
  findUserProfileByUserId: (userId: string) => (usePrisma ? createPrisma().userProfile.findUnique({ where: { userId } }) : memory.findUserProfileByUserId(userId)),
  updateUserProfile: (userId: string, data: any) => (usePrisma ? createPrisma().userProfile.update({ where: { userId }, data }) : memory.updateUserProfile(userId, data)),

  // InvestmentCategory
  createInvestmentCategory: (data: any) => (usePrisma ? createPrisma().investmentCategory.create({ data }) : memory.createInvestmentCategory(data)),
  findInvestmentCategoryById: (id: string) => (usePrisma ? createPrisma().investmentCategory.findUnique({ where: { id } }) : memory.findInvestmentCategoryById(id)),
  findInvestmentCategoryBySlug: (slug: string) => (usePrisma ? createPrisma().investmentCategory.findUnique({ where: { slug } }) : memory.findInvestmentCategoryBySlug(slug)),
  listInvestmentCategories: (onlyActive = true) => (usePrisma ? createPrisma().investmentCategory.findMany({ where: { isActive: onlyActive } }) : memory.listInvestmentCategories(onlyActive)),
  updateInvestmentCategory: (id: string, data: any) => (usePrisma ? createPrisma().investmentCategory.update({ where: { id }, data }) : memory.updateInvestmentCategory(id, data)),
  deleteInvestmentCategory: (id: string) => (usePrisma ? createPrisma().investmentCategory.delete({ where: { id } }) : memory.deleteInvestmentCategory(id)),

  // EligibilityRule
  createEligibilityRule: (data: any) => (usePrisma ? createPrisma().eligibilityRule.create({ data }) : memory.createEligibilityRule(data)),
  findEligibilityRuleById: (id: string) => (usePrisma ? createPrisma().eligibilityRule.findUnique({ where: { id } }) : memory.findEligibilityRuleById(id)),
  findEligibilityRuleByRuleId: (ruleId: string) => (usePrisma ? createPrisma().eligibilityRule.findUnique({ where: { ruleId } }) : memory.findEligibilityRuleByRuleId(ruleId)),
  listEligibilityRules: (filter?: any) => (usePrisma ? createPrisma().eligibilityRule.findMany({ where: filter }) : memory.listEligibilityRules(filter)),
  updateEligibilityRule: (id: string, data: any) => (usePrisma ? createPrisma().eligibilityRule.update({ where: { id }, data }) : memory.updateEligibilityRule(id, data)),
  deleteEligibilityRule: (id: string) => (usePrisma ? createPrisma().eligibilityRule.delete({ where: { id } }) : memory.deleteEligibilityRule(id)),

  // RegulatorySource
  createRegulatorySource: (data: any) => (usePrisma ? createPrisma().regulatorySource.create({ data }) : memory.createRegulatorySource(data)),
  listRegulatorySources: () => (usePrisma ? createPrisma().regulatorySource.findMany() : memory.listRegulatorySources()),

  // EligibilityCheck
  createEligibilityCheck: (data: any) => (usePrisma ? createPrisma().eligibilityCheck.create({ data }) : memory.createEligibilityCheck(data)),
  findEligibilityCheckById: (id: string) => (usePrisma ? createPrisma().eligibilityCheck.findUnique({ where: { id } }) : memory.findEligibilityCheckById(id)),
  listEligibilityChecksByUser: (userId: string) => (usePrisma ? createPrisma().eligibilityCheck.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }) : memory.listEligibilityChecksByUser(userId)),
  deleteEligibilityCheck: (id: string) => (usePrisma ? createPrisma().eligibilityCheck.delete({ where: { id } }) : memory.deleteEligibilityCheck(id)),

  // EligibilityResult
  createEligibilityResult: (data: any) => (usePrisma ? createPrisma().eligibilityResult.create({ data }) : memory.createEligibilityResult(data)),
  listEligibilityResultsByCheck: (checkId: string) => (usePrisma ? createPrisma().eligibilityResult.findMany({ where: { checkId } }) : memory.listEligibilityResultsByCheck(checkId)),

  // Checklist
  createChecklist: (data: any) => (usePrisma ? createPrisma().checklist.create({ data }) : memory.createChecklist(data)),
  findChecklistById: (id: string) => (usePrisma ? createPrisma().checklist.findUnique({ where: { id } }) : memory.findChecklistById(id)),
  listChecklistsByUser: (userId: string) => (usePrisma ? createPrisma().checklist.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }) : memory.listChecklistsByUser(userId)),
  updateChecklist: (id: string, data: any) => (usePrisma ? createPrisma().checklist.update({ where: { id }, data }) : memory.updateChecklist(id, data)),
  deleteChecklist: (id: string) => (usePrisma ? createPrisma().checklist.delete({ where: { id } }) : memory.deleteChecklist(id)),

  // ChecklistItem
  createChecklistItem: (data: any) => (usePrisma ? createPrisma().checklistItem.create({ data }) : memory.createChecklistItem(data)),
  listChecklistItems: (checklistId: string) => (usePrisma ? createPrisma().checklistItem.findMany({ where: { checklistId }, orderBy: { order: 'asc' } }) : memory.listChecklistItems(checklistId)),
  updateChecklistItem: (id: string, data: any) => (usePrisma ? createPrisma().checklistItem.update({ where: { id }, data }) : memory.updateChecklistItem(id, data)),
  deleteChecklistItem: (id: string) => (usePrisma ? createPrisma().checklistItem.delete({ where: { id } }) : memory.deleteChecklistItem(id)),

  // SavedInvestment
  createSavedInvestment: (data: any) => (usePrisma ? createPrisma().savedInvestment.create({ data }) : memory.createSavedInvestment(data)),
  listSavedInvestmentsByUser: (userId: string) => (usePrisma ? createPrisma().savedInvestment.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }) : memory.listSavedInvestmentsByUser(userId)),
  findSavedInvestmentById: (id: string) => (usePrisma ? createPrisma().savedInvestment.findUnique({ where: { id } }) : memory.findSavedInvestmentById(id)),
  deleteSavedInvestment: (id: string) => (usePrisma ? createPrisma().savedInvestment.delete({ where: { id } }) : memory.deleteSavedInvestment(id)),

  // RegulatoryUpdate
  createRegulatoryUpdate: (data: any) => (usePrisma ? createPrisma().regulatoryUpdate.create({ data }) : memory.createRegulatoryUpdate(data)),
  listRegulatoryUpdates: (onlyActive = true) => (usePrisma ? createPrisma().regulatoryUpdate.findMany({ where: { isActive: onlyActive }, orderBy: { publishedAt: 'desc' } }) : memory.listRegulatoryUpdates(onlyActive)),

  // ChatConversation
  createChatConversation: (data: any) => (usePrisma ? createPrisma().chatConversation.create({ data }) : memory.createChatConversation(data)),
  findChatConversationById: (id: string) => (usePrisma ? createPrisma().chatConversation.findUnique({ where: { id } }) : memory.findChatConversationById(id)),
  listChatConversations: (userId?: string) => (usePrisma ? createPrisma().chatConversation.findMany({ where: userId ? { userId } : {}, orderBy: { updatedAt: 'desc' } }) : memory.listChatConversations(userId)),
  updateChatConversation: (id: string, data: any) => (usePrisma ? createPrisma().chatConversation.update({ where: { id }, data }) : memory.updateChatConversation(id, data)),

  // ChatMessage
  createChatMessage: (data: any) => (usePrisma ? createPrisma().chatMessage.create({ data }) : memory.createChatMessage(data)),
  listChatMessages: (conversationId: string) => (usePrisma ? createPrisma().chatMessage.findMany({ where: { conversationId }, orderBy: { createdAt: 'asc' } }) : memory.listChatMessages(conversationId)),

  $connect: tryConnectPrisma,
  $disconnect: async () => {
    if (usePrisma && prisma) await prisma.$disconnect();
    else await memory.$disconnect();
  },
};

export default db;
