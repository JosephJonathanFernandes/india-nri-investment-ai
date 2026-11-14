import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../db';
import { seedDemoData } from '../seed';
import { createServer } from '../index';
import type { Server } from 'http';

let server: Server;
let baseUrl: string;
let authToken: string;
let testUserId: string;

const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'SecureP@ssw0rd!',
};

describe('API Integration', () => {
  beforeAll(async () => {
    await seedDemoData();
    server = createServer(0);
    await new Promise<void>((resolve) => {
      server.on('listening', () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.$disconnect();
  });

  // CSRF token cache
  let csrfToken: string | null = null;

  async function getCsrfToken(): Promise<string> {
    if (csrfToken) return csrfToken;
    const res = await fetch(`${baseUrl}/api/auth/csrf-token`);
    const setCookie = res.headers.get('set-cookie') ?? '';
    const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
    csrfToken = match ? match[1] : '';
    return csrfToken;
  }

  const request = async (method: string, path: string, body?: any, token?: string) => {
    const isStateChanging = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Add CSRF token for state-changing requests
    if (isStateChanging) {
      const token = await getCsrfToken();
      headers['X-XSRF-TOKEN'] = token;
      headers['Cookie'] = `XSRF-TOKEN=${token}`;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data: any = null;
    try {
      data = await res.json();
    } catch {}
    return { status: res.status, data };
  };

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const { status, data } = await request('POST', '/api/auth/register', TEST_USER);
      expect(status).toBe(201);
      expect(data.user.email).toBe(TEST_USER.email);
      expect(data.accessToken).toBeDefined();
      testUserId = data.user.id;
    });

    it('should not allow duplicate registration', async () => {
      const { status } = await request('POST', '/api/auth/register', TEST_USER);
      expect(status).toBe(409);
    });

    it('should login successfully', async () => {
      const { status, data } = await request('POST', '/api/auth/login', {
        email: TEST_USER.email,
        password: TEST_USER.password,
      });
      expect(status).toBe(200);
      expect(data.accessToken).toBeDefined();
      authToken = data.accessToken;
    });

    it('should reject wrong password', async () => {
      const { status } = await request('POST', '/api/auth/login', {
        email: TEST_USER.email,
        password: 'WrongPassword123!',
      });
      expect(status).toBe(401);
    });

    it('should get current user profile', async () => {
      const { status, data } = await request('GET', '/api/auth/me', undefined, authToken);
      expect(status).toBe(200);
      expect(data.user.email).toBe(TEST_USER.email);
    });
  });

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const { status, data } = await request(
        'PUT',
        '/api/profile',
        {
          countryOfResidence: 'United States',
          residencyStatus: 'NRI',
          investmentObjectives: ['Long-term wealth creation'],
          riskPreference: 'Moderate',
          investmentAmountRange: '₹50 lakh - ₹1 crore',
          repatriationPreference: 'Prefer full repatriation where legally permitted',
          existingBanking: ['NRE account'],
        },
        authToken
      );
      expect(status).toBe(200);
      expect(data.profile.countryOfResidence).toBe('United States');
    });

    it('should get user profile', async () => {
      const { status, data } = await request('GET', '/api/profile', undefined, authToken);
      expect(status).toBe(200);
      expect(data.profile.countryOfResidence).toBe('United States');
    });

    it('should validate required fields', async () => {
      const { status } = await request(
        'PUT',
        '/api/profile',
        {
          countryOfResidence: '',
        },
        authToken
      );
      expect(status).toBe(400);
    });
  });

  describe('Eligibility Checker', () => {
    it('should run an eligibility check', async () => {
      const { status, data } = await request(
        'POST',
        '/api/eligibility/check',
        {
          category: 'Indian Mutual Funds',
        },
        authToken
      );
      expect(status).toBe(200);
      expect(data.overallOutcome).toBeDefined();
      expect(data.results.length).toBeGreaterThan(0);
      expect(data.checkId).toBeDefined();
    });

    it('should return insufficient info without profile', async () => {
      // Create a separate user without profile
      const { status, data } = await request('POST', '/api/auth/register', {
        name: 'No Profile User',
        email: 'noprofile@example.com',
        password: 'Password123!',
      });
      const noProfileToken = data.accessToken;

      const { status: chkStatus, data: chkData } = await request(
        'POST',
        '/api/eligibility/check',
        {
          category: 'Indian Mutual Funds',
        },
        noProfileToken
      );
      expect(chkStatus).toBe(400);
      expect(chkData.error).toBe('profile_incomplete');
    });

    it('should get eligibility history', async () => {
      const { status, data } = await request(
        'GET',
        '/api/eligibility/history',
        undefined,
        authToken
      );
      expect(status).toBe(200);
      expect(data.checks.length).toBeGreaterThan(0);
    });
  });

  describe('Investment Categories', () => {
    it('should list investment categories', async () => {
      const { status, data } = await request('GET', '/api/investments/categories');
      expect(status).toBe(200);
      expect(data.categories.length).toBeGreaterThan(0);
      expect(data.categories[0].name).toBeDefined();
      expect(data.categories[0].slug).toBeDefined();
    });
  });

  describe('Rules (Auth Required)', () => {
    it('should list eligibility rules', async () => {
      const { status, data } = await request('GET', '/api/rules', undefined, authToken);
      expect(status).toBe(200);
      expect(data.rules.length).toBeGreaterThan(0);
    });

    it('should reject unauthenticated access to rules', async () => {
      const { status } = await request('GET', '/api/rules');
      expect(status).toBe(401);
    });
  });

  describe('Checklist', () => {
    it('should create a checklist', async () => {
      const { status, data } = await request(
        'POST',
        '/api/checklists',
        {
          title: 'My Investment Checklist',
          category: 'NRI Investment',
        },
        authToken
      );
      expect(status).toBe(201);
      expect(data.checklist.title).toBe('My Investment Checklist');
    });

    it('should add an item to checklist', async () => {
      const { status: listStatus, data: listData } = await request(
        'GET',
        '/api/checklists',
        undefined,
        authToken
      );
      expect(listStatus).toBe(200);
      const checklistId = listData.checklists[0].id;

      const { status, data } = await request(
        'POST',
        `/api/checklists/${checklistId}/items`,
        {
          title: 'PAN card',
          isConditional: true,
          order: 0,
        },
        authToken
      );
      expect(status).toBe(201);
      expect(data.item.title).toBe('PAN card');
    });

    it('should toggle checklist item completion', async () => {
      const { status: listStatus, data: listData } = await request(
        'GET',
        '/api/checklists',
        undefined,
        authToken
      );
      const checklistId = listData.checklists[0].id;

      const { status: itemsStatus, data: itemsData } = await request(
        'GET',
        `/api/checklists/${checklistId}/items`,
        undefined,
        authToken
      );
      const itemId = itemsData.items[0].id;

      const { status, data } = await request(
        'PUT',
        `/api/checklists/${checklistId}/items/${itemId}`,
        {
          isCompleted: true,
        },
        authToken
      );
      expect(status).toBe(200);
      expect(data.item.isCompleted).toBe(true);
    });

    it("should not allow accessing another user's checklist", async () => {
      // Register a second user
      const { status: regStatus, data: regData } = await request('POST', '/api/auth/register', {
        name: 'Other User',
        email: 'other@example.com',
        password: 'Password123!',
      });
      const otherToken = regData.accessToken;

      const { status } = await request('GET', '/api/checklists', undefined, otherToken);
      expect(status).toBe(200);
      // Other user should have no checklists
      const data: any = await (await request('GET', '/api/checklists', undefined, otherToken)).data;
      expect(data.checklists.length).toBe(0);
    });
  });

  describe('Tax Estimate', () => {
    it('should calculate tax estimate', async () => {
      const { status, data } = await request(
        'POST',
        '/api/tax/estimate',
        {
          investmentType: 'Indian Mutual Funds (Equity)',
          investmentAmount: 1000000,
          purchaseValue: 800000,
          saleValue: 1000000,
          holdingPeriodYears: 2,
          countryOfTaxResidence: 'United States',
        },
        authToken
      );
      expect(status).toBe(200);
      expect(data.estimate.available).toBe(true);
      expect(data.estimate.gainOrLoss).toBe(200000);
    });

    it('should mark as illustrative', async () => {
      const { status, data } = await request(
        'POST',
        '/api/tax/estimate',
        {
          investmentType: 'Indian Mutual Funds (Equity)',
          investmentAmount: 1000000,
          purchaseValue: 800000,
          saleValue: 1000000,
          holdingPeriodYears: 2,
        },
        authToken
      );
      expect(status).toBe(200);
      expect(data.version).toContain('illustrative');
    });
  });

  describe('Access Controls', () => {
    it('should not allow unauthenticated access to profile', async () => {
      const { status } = await request('GET', '/api/profile');
      expect(status).toBe(401);
    });

    it('should not allow unauthenticated access to eligibility history', async () => {
      const { status } = await request('GET', '/api/eligibility/history');
      expect(status).toBe(401);
    });
  });

  describe('Security - Password Strength', () => {
    it('should reject weak password (too short)', async () => {
      const { status } = await request('POST', '/api/auth/register', {
        name: 'Weak User',
        email: 'weak@example.com',
        password: 'weak',
      });
      expect(status).toBe(400);
    });

    it('should reject weak password (no uppercase)', async () => {
      const { status } = await request('POST', '/api/auth/register', {
        name: 'Weak User',
        email: 'weak2@example.com',
        password: 'password123!',
      });
      expect(status).toBe(400);
    });

    it('should reject weak password (no number)', async () => {
      const { status } = await request('POST', '/api/auth/register', {
        name: 'Weak User',
        email: 'weak3@example.com',
        password: 'Password!',
      });
      expect(status).toBe(400);
    });

    it('should accept strong password', async () => {
      const { status } = await request('POST', '/api/auth/register', {
        name: 'Strong User',
        email: 'strong@example.com',
        password: 'SecureP@ssw0rd!',
      });
      expect(status).toBe(201);
    });
  });

  describe('Security - Account Lockout', () => {
    it('should lock account after 5 failed attempts', async () => {
      // Use an existing email but wrong password repeatedly
      const email = 'lockout@example.com';
      await request('POST', '/api/auth/register', {
        name: 'Lockout User',
        email,
        password: 'LockoutP@ssw0rd!',
      });

      // Fail 5 times
      for (let i = 0; i < 5; i++) {
        const { status } = await request('POST', '/api/auth/login', {
          email,
          password: 'WrongP@ssw0rd!',
        });
        expect(status).toBe(401);
      }

      // 6th attempt should be locked
      const { status, data } = await request('POST', '/api/auth/login', {
        email,
        password: 'WrongP@ssw0rd!',
      });
      expect(status).toBe(423);
      expect(data.error).toBe('account_locked');
    });

    it('should allow login after lockout expires', async () => {
      // Register a new user
      const email = 'lockout2@example.com';
      await request('POST', '/api/auth/register', {
        name: 'Lockout2 User',
        email,
        password: 'Lockout2P@ssw0rd!',
      });

      // Fail 5 times to trigger lockout
      for (let i = 0; i < 5; i++) {
        await request('POST', '/api/auth/login', {
          email,
          password: 'WrongP@ssw0rd!',
        });
      }

      // Directly update the DB to clear the lockout (simulating time passing)
      const user = await db.findUserByEmail(email);
      if (user) {
        await db.updateUser(user.id, { lockoutUntil: new Date(Date.now() - 60000) });
      }

      // Should now be able to login
      const { status, data } = await request('POST', '/api/auth/login', {
        email,
        password: 'Lockout2P@ssw0rd!',
      });
      expect(status).toBe(200);
      expect(data.accessToken).toBeDefined();
    });
  });

  describe('Security - CSRF Token', () => {
    it('should get CSRF token cookie', async () => {
      const res = await fetch(`${baseUrl}/api/auth/csrf-token`);
      expect(res.status).toBe(200);
      const setCookie = res.headers.get('set-cookie');
      expect(setCookie).toContain('XSRF-TOKEN=');
    });

    it('should reject state-changing request without CSRF token', async () => {
      // Register a user first to get a token
      await request('POST', '/api/auth/register', {
        name: 'CSRF User',
        email: 'csrf@example.com',
        password: 'CsrfP@ssw0rd!',
      });

      // Try to update profile without CSRF header
      const { status } = await fetch(`${baseUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          countryOfResidence: 'United States',
          residencyStatus: 'NRI',
          investmentObjectives: ['Long-term wealth creation'],
          riskPreference: 'Moderate',
          investmentAmountRange: '₹50 lakh - ₹1 crore',
          repatriationPreference: 'Prefer full repatriation where legally permitted',
          existingBanking: ['NRE account'],
        }),
      });
      expect(status).toBe(403);
    });
  });

  describe('Security - Account Export & Delete', () => {
    let exportUserToken: string;
    let exportUserId: string;

    beforeAll(async () => {
      // Register a user for export/delete tests
      const { status, data } = await request('POST', '/api/auth/register', {
        name: 'Export User',
        email: 'export@example.com',
        password: 'ExportP@ssw0rd!',
      });
      exportUserToken = data.accessToken;
      exportUserId = data.user.id;

      // Create some data for the user
      await request(
        'PUT',
        '/api/profile',
        {
          countryOfResidence: 'United States',
          residencyStatus: 'NRI',
          investmentObjectives: ['Long-term wealth creation'],
          riskPreference: 'Moderate',
          investmentAmountRange: '₹50 lakh - ₹1 crore',
          repatriationPreference: 'Prefer full repatriation where legally permitted',
          existingBanking: ['NRE account'],
        },
        exportUserToken
      );

      await request(
        'POST',
        '/api/eligibility/check',
        { category: 'Indian Mutual Funds' },
        exportUserToken
      );
    });

    it('should export user data', async () => {
      const { status, data } = await request(
        'GET',
        '/api/auth/account/export',
        undefined,
        exportUserToken
      );
      expect(status).toBe(200);
      expect(data.user.email).toBe('export@example.com');
      expect(data.profile.countryOfResidence).toBe('United States');
      expect(data.eligibilityChecks.length).toBeGreaterThan(0);
    });

    it('should delete account and all data', async () => {
      const { status } = await request(
        'DELETE',
        '/api/auth/account',
        undefined,
        exportUserToken
      );
      expect(status).toBe(200);

      // Verify user can no longer access profile
      const { status: status2 } = await request(
        'GET',
        '/api/auth/me',
        undefined,
        exportUserToken
      );
      expect(status2).toBe(404);
    });
  });
});
