# india-nri-investment-ai

AI-powered FinTech platform that helps Non-Resident Indians (NRIs) understand which investments in India may be available to them based on their country of residence, residency status, investment goals, and repatriation requirements.

## Features

- **Landing page** — hero, features, dashboard preview, how it works, FAQ, footer
- **User onboarding** — multi-step wizard (country, residency status, objectives, risk, amount, repatriation, banking)
- **Personalized dashboard** — welcome, profile summary, eligibility overview with **Recharts outcome donut & risk/liquidity charts**, categories, checklist, recent checks, regulatory updates, quick actions
- **Investment eligibility checker** — deterministic rules engine across **9 investment categories × 7 countries × NRI/OCI/Other** (57 versioned rules) with plain-language results, conditions, account types, repatriation & tax considerations, official sources, and **PDF export**
- **AI Regulatory Assistant** — RAG-enabled chat (OpenAI with mock fallback), cites official sources (RBI, SEBI, Income Tax, etc.), separates eligibility from tax advice
- **Account & document checklist** — conditional checklist generator with save progress
- **Tax & repatriation explainer** — versioned illustrative estimates, clearly marked as not definitive
- **Investment comparison** — side-by-side comparison table **+ Recharts risk & liquidity bar chart**
- **Settings & profile** — profile management, onboarding, logout, **light/dark mode**
- **Admin panel** — rule management (add/edit/delete), source URLs, review status, unresolved cases, regulatory updates, audit logging
- **Secure authentication** — JWT access/refresh tokens (httpOnly cookies), bcrypt password hashing, ownership-based authorization
- **PostgreSQL + Prisma** with in-memory fallback for demo (no database required to run)
- **Automated tests** (vitest) for the eligibility engine
- **Responsive design** — mobile, tablet, desktop; navy/white/emerald premium FinTech theme

## Tech Stack

- Frontend: React + TypeScript, Tailwind CSS, shadcn/ui-style components, Lucide React, Recharts, React Router
- Backend: Node.js + Express, Prisma ORM (PostgreSQL), JWT authentication, bcrypt
- AI: OpenAI API (with deterministic mock fallback)
- Tests: Vitest

## Project Structure

```
nri-investment-simplifier/
├── server/                 # Backend (Express + TypeScript + Prisma)
│   ├── prisma/schema.prisma   # Database schema
│   ├── src/
│   │   ├── index.ts           # Express app entry
│   │   ├── db.ts              # Prisma + in-memory store
│   │   ├── config.ts          # Configuration
│   │   ├── auth.ts            # JWT helpers
│   │   ├── services/
│   │   │   ├── eligibilityEngine.ts   # Deterministic rules engine
│   │   │   ├── aiAssistant.ts         # OpenAI + mock assistant
│   │   │   └── taxEstimator.ts        # Versioned tax estimator
│   │   ├── middleware/        # auth, validation, rate limiting
│   │   ├── routes/            # REST API routes
│   │   ├── seed.ts            # Demo seed data
│   │   └── tests/             # Vitest tests
│   └── package.json
├── web/                     # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/             # Route pages
│   │   ├── components/        # UI components & layout
│   │   ├── context/           # Auth context
│   │   ├── lib/               # API & auth helpers
│   │   ├── App.tsx            # Router
│   │   └── index.css          # Tailwind styles
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── .env.example             # Environment variable placeholders
└── README.md
```

## Prerequisites

- Node.js v18+ and npm
- PostgreSQL (optional — the app falls back to an in-memory store if no database is available)

## Setup

### 1. Clone / open the project

```bash
cd nri-investment-simplifier
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example server/.env   # or create server/.env manually
```

Edit `server/.env`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nri_investment_simplifier"
JWT_ACCESS_SECRET=replace-with-a-strong-random-secret
JWT_REFRESH_SECRET=replace-with-a-strong-random-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
OPENAI_API_KEY=sk-...               # optional; mock assistant used if omitted
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
ADMIN_EMAIL=admin@nrisimplifier.local
ADMIN_PASSWORD=AdminChangeMe123!
```

> Never commit real secrets. `.env.example` contains placeholder values only.

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Database setup (PostgreSQL)

If you have PostgreSQL, create the database and run migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # or: npx tsx src/seed.ts
```

If PostgreSQL is not available, the app automatically uses an in-memory store with seeded demo data on startup.

### 5. Install frontend dependencies

```bash
cd ../web
npm install
```

### 6. Run the application

Start the backend (terminal 1):

```bash
cd server
npm run dev        # http://localhost:4000
```

Start the frontend (terminal 2):

```bash
cd web
npm run dev        # http://localhost:5173
```

The frontend proxies `/api` requests to `http://localhost:4000`.

### 7. Seed demo data

The server auto-seeds demonstration data on startup when using the in-memory store. To seed manually:

```bash
cd server
npm run prisma:seed   # tsx src/seed.ts
```

Demo admin credentials (from `.env`):
- Email: `admin@nrisimplifier.local`
- Password: `AdminChangeMe123!`

## Scripts

### Server (`server/`)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start with tsx (watch) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:seed` | Seed demo data |
| `npm test` | Run vitest |

### Web (`web/`)

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm test` | Run vitest |

## Regulatory & Safety Notes

- Eligibility rules are **versioned records** with `reviewStatus` (`VERIFIED`, `PENDING`, `OUTDATED`, `ILLUSTRATIVE`), source URLs, effective dates, and last-verified dates.
- Demo rules are marked `ILLUSTRATIVE` and are **not current law**. They are clearly labeled in the UI.
- The engine never silently overrides conflicting rules — conflicts produce an `UNRESOLVED` result flagged for manual review.
- The AI assistant cites official sources (RBI, SEBI, Income Tax Department, Ministry of Finance, official exchanges) where available and never fabricates citations.
- Tax estimates are versioned illustrative references only — never a definitive liability.
- The platform provides educational guidance only and is not a substitute for professional legal, tax, or investment advice.
- Passwords are hashed with bcrypt; never stored in plaintext. Users can only access their own profiles, checks, checklists, and saved investments.

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/register` | Register |
| `POST /api/auth/login` | Login (sets httpOnly cookies) |
| `POST /api/auth/logout` | Logout |
| `POST /api/auth/refresh` | Refresh access token |
| `GET /api/auth/me` | Current user + profile |
| `GET /api/profile` | Get profile |
| `PUT /api/profile` | Update profile |
| `POST /api/eligibility/check` | Run eligibility check |
| `GET /api/eligibility/history` | User's check history |
| `GET /api/investments/categories` | List investment categories |
| `GET /api/rules` | List eligibility rules (auth) |
| `POST /api/rules` | Create rule (admin) |
| `PUT /api/rules/:id` | Update rule (admin) |
| `DELETE /api/rules/:id` | Delete rule (admin) |
| `GET /api/sources` | List regulatory sources |
| `POST /api/assistant/chat` | AI assistant chat |
| `GET /api/assistant/conversations` | List conversations |
| `GET /api/checklists` | User's checklists |
| `POST /api/checklists` | Create checklist |
| `PUT /api/checklists/:id` | Update checklist |
| `POST /api/checklists/:id/items` | Add item |
| `PUT /api/checklists/:id/items/:itemId` | Update item |
| `DELETE /api/checklists/:id/items/:itemId` | Delete item |
| `POST /api/tax/estimate` | Illustrative tax estimate |
| `GET /api/saved-investments` | User's saved investments |
| `POST /api/saved-investments` | Save investment |
| `DELETE /api/saved-investments/:id` | Remove saved investment |
| `GET /api/admin/unresolved-checks` | Unresolved cases (admin) |
| `GET /api/admin/updates` | Regulatory updates (admin) |
| `POST /api/admin/updates` | Publish update (admin) |

## Database

The Prisma schema (`server/prisma/schema.prisma`) defines models for `User`, `UserProfile`, `InvestmentCategory`, `EligibilityRule`, `RegulatorySource`, `EligibilityCheck`, `EligibilityResult`, `Checklist`, `ChecklistItem`, `SavedInvestment`, `RegulatoryUpdate`, `ChatConversation`, and `ChatMessage`, with timestamps, indexes, relations, and rule versioning.

Run `npx prisma migrate dev` to apply schema changes.
