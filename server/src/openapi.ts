/**
 * OpenAPI specification for NRI Investment Simplifier API
 * This document describes all available API endpoints, request/response formats,
 * authentication requirements, and error responses.
 */

export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'NRI Investment Simplifier API',
    version: '1.0.0',
    description:
      'AI-powered FinTech platform that helps Non-Resident Indians (NRIs) understand ' +
      'which investments in India may be available to them based on their country of residence, ' +
      'residency status, investment goals, and repatriation requirements.',
    contact: {
      name: 'NRI Investment Simplifier Team',
      email: 'support@nrisimplifier.local',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server',
    },
    {
      url: 'https://api.nrisimplifier.local',
      description: 'Production server',
    },
  ],
  tags: [
    { name: 'Authentication', description: 'User authentication and account management' },
    { name: 'Profile', description: 'User profile management' },
    { name: 'Eligibility', description: 'Investment eligibility checks' },
    { name: 'Investments', description: 'Investment categories and information' },
    { name: 'Rules', description: 'Regulatory eligibility rules management (Admin)' },
    { name: 'Sources', description: 'Regulatory sources' },
    { name: 'Assistant', description: 'AI regulatory assistant chat' },
    { name: 'Checklist', description: 'Document checklist management' },
    { name: 'Tax', description: 'Tax and repatriation estimation' },
    { name: 'Saved Investments', description: 'User saved investment options' },
    { name: 'Admin', description: 'Administrator-only operations' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token obtained from /api/auth/login',
      },
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-XSRF-TOKEN',
        description: 'CSRF token obtained from /api/auth/csrf-token cookie',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
        description: 'JWT access token stored in httpOnly cookie',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'Unique user identifier' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          name: { type: 'string', description: 'User full name' },
          role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User role' },
          emailVerified: { type: 'boolean', description: 'Whether email is verified' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UserProfile: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          countryOfResidence: { type: 'string' },
          residencyStatus: { type: 'string', enum: ['NRI', 'OCI', 'Other / unsure'] },
          investmentObjectives: { type: 'array', items: { type: 'string' } },
          riskPreference: { type: 'string', enum: ['Conservative', 'Moderate', 'Aggressive'] },
          investmentAmountRange: { type: 'string' },
          repatriationPreference: { type: 'string' },
          existingBanking: { type: 'array', items: { type: 'string' } },
          completedOnboarding: { type: 'boolean' },
        },
      },
      InvestmentCategory: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          riskLevel: { type: 'string' },
          liquidity: { type: 'string' },
          repatriation: { type: 'string' },
          taxComplexity: { type: 'string' },
          accountRequirements: { type: 'string' },
          officialSources: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
        },
      },
      EligibilityCheck: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          categoryId: { type: 'string', format: 'uuid' },
          countryOfResidence: { type: 'string' },
          residencyStatus: { type: 'string' },
          investmentAmount: { type: 'string' },
          repatriationPreference: { type: 'string' },
          overallOutcome: { type: 'string' },
          summary: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      EligibilityResult: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          category: { type: 'string' },
          outcome: { type: 'string' },
          label: { type: 'string' },
          explanation: { type: 'string' },
          conditions: { type: 'string' },
          exceptions: { type: 'string' },
          accountType: { type: 'string' },
          documentation: { type: 'string' },
          repatriation: { type: 'string' },
          taxConsiderations: { type: 'string' },
          sourceUrl: { type: 'string' },
          sourceName: { type: 'string' },
          reviewStatus: { type: 'string' },
          version: { type: 'integer' },
          isIllustrative: { type: 'boolean' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  tags: [
    { name: 'Authentication', description: 'User authentication operations' },
    { name: 'Profile', description: 'User profile management' },
    { name: 'Eligibility', description: 'Investment eligibility checks' },
    { name: 'Investments', description: 'Investment categories' },
    { name: 'Rules', description: 'Eligibility rules management (Admin only)' },
    { name: 'Sources', description: 'Regulatory sources' },
    { name: 'Assistant', description: 'AI regulatory assistant' },
    { name: 'Checklist', description: 'Document checklist management' },
    { name: 'Tax', description: 'Tax estimation' },
    { name: 'Saved Investments', description: 'Saved investment options' },
    { name: 'Admin', description: 'Administrator operations' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', description: 'Full name' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8, description: 'Password' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    accessToken: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/schemas/ErrorResponse' },
          409: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    accessToken: { type: 'string' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/schemas/ErrorResponse' },
          423: { description: 'Account locked' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'User logout',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    profile: { $ref: '#/components/schemas/UserProfile' },
                    onboardingCompleted: { type: 'boolean' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/api/auth/account/export': {
      get: {
        tags: ['Authentication'],
        summary: 'Export user data (GDPR)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User data export',
          },
        },
      },
    },
    '/api/auth/account': {
      delete: {
        tags: ['Authentication'],
        summary: 'Delete account (GDPR right to erasure)',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Account deleted',
          },
        },
      },
    },
    '/api/profile': {
      get: {
        tags: ['Profile'],
        summary: 'Get user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: { $ref: '#/components/schemas/User' },
                    profile: { $ref: '#/components/schemas/UserProfile' },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
      put: {
        tags: ['Profile'],
        summary: 'Update user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  countryOfResidence: { type: 'string' },
                  residencyStatus: { type: 'string' },
                  investmentObjectives: { type: 'array', items: { type: 'string' } },
                  riskPreference: { type: 'string' },
                  investmentAmountRange: { type: 'string' },
                  repatriationPreference: { type: 'string' },
                  existingBanking: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          400: { $ref: '#/components/schemas/ErrorResponse' },
          401: { $ref: '#/components/schemas/ErrorResponse' },
        },
      },
    },
    '/api/eligibility/check': {
      post: {
        tags: ['Eligibility'],
        summary: 'Run eligibility check',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  investmentAmount: { type: 'string' },
                  repatriationPreference: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Eligibility check result',
          },
        },
      },
    },
    '/api/eligibility/history': {
      get: {
        tags: ['Eligibility'],
        summary: 'Get eligibility check history',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Eligibility check history',
          },
        },
      },
    },
    '/api/investments/categories': {
      get: {
        tags: ['Investments'],
        summary: 'List investment categories',
        security: [],
        responses: {
          200: {
            description: 'Investment categories',
          },
        },
      },
    },
    '/api/rules': {
      get: {
        tags: ['Rules'],
        summary: 'List eligibility rules',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Eligibility rules',
          },
        },
      },
      post: {
        tags: ['Rules'],
        summary: 'Create eligibility rule (Admin)',
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: 'Rule created' },
          403: { description: 'Admin required' },
        },
      },
    },
    '/api/assistant/chat': {
      post: {
        tags: ['Assistant'],
        summary: 'Chat with AI assistant',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  message: { type: 'string' },
                  conversationId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Assistant response',
          },
        },
      },
    },
    '/api/checklists': {
      get: {
        tags: ['Checklist'],
        summary: 'List checklists',
        security: [{ bearerAuth: [] }],
      },
      post: {
        tags: ['Checklist'],
        summary: 'Create checklist',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/tax/estimate': {
      post: {
        tags: ['Tax'],
        summary: 'Estimate tax',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  investmentType: { type: 'string' },
                  investmentAmount: { type: 'number' },
                  purchaseValue: { type: 'number' },
                  saleValue: { type: 'number' },
                  holdingPeriodYears: { type: 'number' },
                  countryOfTaxResidence: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Tax estimate',
          },
        },
      },
    },
    '/api/saved-investments': {
      get: {
        tags: ['Saved Investments'],
        summary: 'List saved investments',
        security: [{ bearerAuth: [] }],
      },
      post: {
        tags: ['Saved Investments'],
        summary: 'Save investment',
        security: [{ bearerAuth: [] }],
      },
    },
  },
};
