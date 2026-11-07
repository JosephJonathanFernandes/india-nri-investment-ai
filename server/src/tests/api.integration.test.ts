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
  password: 'Password123!',
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

  const request = async (method: string, path: string, body?: any, token?: string) => {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
});
