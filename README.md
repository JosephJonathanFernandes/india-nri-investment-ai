# india-nri-investment-ai

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT-4o-mini-74AA9C?style=for-the-badge&logo=openai&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-2E9247?style=flat-square)](https://vitest.dev/)

</div>

---

## 🇮🇳 NRI Investment Simplifier

**AI-Powered FinTech Platform for Non-Resident Indians**

Helps NRIs understand which investments in India may be available to them based on their **country of residence**, **residency status (NRI/OCI)**, **investment goals**, and **repatriation requirements**. Complex Indian investment regulations (RBI, SEBI, FEMA, Income Tax) are simplified into clear, easy-to-understand guidance.

> ⚠️ **Educational guidance only** — not a substitute for professional legal, tax, or investment advice. Rules marked "ILLUSTRATIVE" are demonstration data and not current law.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Screenshots](#-screenshots)
- [Regulatory Safety](#-regulatory-safety)
- [Project Structure](#-project-structure)
- [Setup](#-setup)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [Testing](#-testing)
- [API Reference](#-api-reference)
- [Admin Panel](#-admin-panel)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Landing Page** | Hero section, feature cards, dashboard preview, how-it-works, FAQ, footer |
| **Multi-step Onboarding** | Country of residence, residency status (NRI/OCI), objectives, risk preference, amount range, repatriation preference, existing banking |
| **Personalized Dashboard** | Welcome message, profile summary, eligibility overview with Recharts donut & risk/liquidity charts, recent checks, saved investments, regulatory updates, quick actions |
| **Eligibility Checker** | Deterministic rules engine across 9 investment categories × 7 countries × NRI/OCI/Other statuses (57 versioned rules) |
| **AI Regulatory Assistant** | RAG-enabled chat (OpenAI GPT-4o-mini with mock fallback), cites RBI/SEBI/Income Tax sources, separates eligibility from tax advice |
| **Document Checklist** | Conditional checklist generator (PAN, KYC, NRE/NRO, FATCA/CRS, etc.) with save progress |
| **Investment Comparison** | Side-by-side comparison table + Recharts risk & liquidity bar chart |
| **Tax & Repatriation Explainer** | Versioned illustrative estimates, clearly marked as non-definitive |
| **Settings & Profile** | Profile management, light/dark mode, logout |
| **Admin Panel** | Rule management (add/edit/delete), source URLs, review status, unresolved cases, regulatory updates |
| **Security** | JWT access/refresh tokens (httpOnly cookies), bcrypt password hashing, ownership-based authorization |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui-style components
- Lucide React (icons)
- React Router DOM
- Recharts (charts)
- jsPDF (PDF export)

**Backend**
- Node.js + Express
- TypeScript
- Prisma ORM (PostgreSQL)
- JWT authentication
- bcryptjs (password hashing)
- Express Validator / Zod (validation)
- Helmet, CORS (security)

**AI & Data**
- OpenAI API (GPT-4o-mini) with deterministic mock fallback
- Versioned, source-cited eligibility rules (RBI, SEBI, Income Tax, etc.)

---

## 🏗 Architecture

```
nri-investment-simplifier/
├── server/                    # Backend (Express + TypeScript + Prisma)
│   ├── prisma/schema.prisma   # Database schema (14 models, versioned rules)
│   ├── src/
│   │   ├── index.ts           # Express app entry
│   │   ├── db.ts              # Prisma + in-memory store (no DB required)
│   │   ├── config.ts          # Configuration
│   │   ├── auth.ts            # JWT helpers
│   │   ├── services/
│   │   │   ├── eligibilityEngine.ts   # Deterministic rules engine
│   │   │   ├── aiAssistant.ts         # OpenAI + mock assistant (RAG)
│   │   │   └── taxEstimator.ts        # Versioned tax estimator
│   │   ├── middleware/        # auth, validation, rate limiting
│   │   ├── routes/            # 14 REST API routes
│   │   ├── seed.ts            # Demo seed data (57 rules, 10 sources)
│   │   └── tests/             # Vitest (8 tests, all passing)
│   └── package.json
├── web/                       # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/             # 17 route pages
│   │   ├── components/        # UI components, charts, layout
│   │   ├── context/           # Auth context
│   │   ├── lib/               # API & auth helpers
│   │   ├── App.tsx            # Router
│   │   └── index.css          # Tailwind styles
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── .github/                   # CI/CD (optional)
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🖼 Screenshots

> Add screenshots here under `docs/screenshots/` and reference them:

| Landing Page | Dashboard | Eligibility Checker |
|-------------|-----------|---------------------|
| `![Landing](./docs/screenshots/landing.png)` | `![Dashboard](./docs/screenshots/dashboard.png)` | `![Eligibility](./docs/screenshots/eligibility.png)` |

| AI Assistant | Comparison | Admin Panel |
|-------------|-----------|-------------|
| `![Assistant](./docs/screenshots/assistant.png)` | `![Comparison](./docs/screenshots/comparison.png)` | `![Admin](./docs/screenshots/admin.png)` |

---

## ⚖ Regulatory Safety

- **Versioned rules** — every rule carries `reviewStatus` (`VERIFIED`, `PENDING`, `OUTDATED`, `ILLUSTRATIVE`), source URLs, effective dates, and last-verified timestamps.
- **Demo rules marked ILLUSTRATIVE** — clearly labeled in the UI as "not current law." Administrators must replace with verified RBI/SEBI rules before production.
- **Conflict policy** — conflicting rules produce an `UNRESOLVED` result flagged for manual review, never arbitrarily selecting one.
- **AI guardrails** — the assistant never fabricates laws, URLs, or citations; states when verification is required; recommends consulting qualified professionals.
- **Tax estimates** — versioned illustrative references only, never a definitive liability.
- **Data access** — users can only access their own profiles, checks, checklists, and saved investments. Admin functions are restricted to authorized administrators.

---

## 📁 Project Structure (Key Models)

| Model | Purpose |
|-------|---------|
| `User` | Authentication & profile ownership |
| `UserProfile` | Onboarding data (country, residency, objectives, risk, banking) |
| `InvestmentCategory` | 9 Indian investment categories with metadata |
| `EligibilityRule` | Versioned regulatory rules with conditions & outcomes |
| `RegulatorySource` | Official source URLs (RBI, SEBI, ITD, etc.) |
| `EligibilityCheck` / `EligibilityResult` | Deterministic check results with rule references |
| `Checklist` / `ChecklistItem` | Conditional document checklists |
| `SavedInvestment` | User-saved investment options |
| `RegulatoryUpdate` | Admin-published regulatory announcements |
| `ChatConversation` / `ChatMessage` | AI assistant chat history |
| `AuditLog` / `RuleVersionHistory` | Admin change tracking |

---

## 🚀 Setup

### Prerequisites
- Node.js v18+
- npm
- PostgreSQL (optional — in-memory store used if no database)

### 1. Clone the repository

```bash
git clone https://github.com/JosephJonathanFernandes/india-nri-investment-ai.git
cd india-nri-investment-ai
```

### 2. Backend setup

```bash
cd server
npm install

# Copy environment variables
cp ../.env.example .env
# Edit .env with your DATABASE_URL, JWT secrets, and OPENAI_API_KEY (optional)

# Generate Prisma client
npx prisma generate

# Run migrations (if using PostgreSQL)
npx prisma migrate dev --name init

# Seed demonstration data
npm run prisma:seed

# Start development server
npm run dev          # http://localhost:4000
```

### 3. Frontend setup

```bash
cd ../web
npm install
npm run dev          # http://localhost:5173
```

The frontend proxies `/api` requests to `http://localhost:4000`.

---

## ⚙ Environment Variables

Create `server/.env` from `.env.example`:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:pass@localhost:5432/nri_investment_simplifier"

# JWT
JWT_ACCESS_SECRET=your-strong-access-secret
JWT_REFRESH_SECRET=your-strong-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cookies
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax

# OpenAI (optional — mock assistant used if omitted)
OPENAI_API_KEY=sk-...

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Admin seed
ADMIN_EMAIL=admin@nrisimplifier.local
ADMIN_PASSWORD=AdminChangeMe123!
```

> ⚠️ Never commit real secrets. `.env.example` contains placeholder values only.

---

## 🗄 Database

The Prisma schema defines 14 models with timestamps, indexes, relations, and rule versioning.

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed   # or: npx tsx src/seed.ts
```

**Demo admin credentials** (from `.env`):
- Email: `admin@nrisimplifier.local`
- Password: `AdminChangeMe123!`

---

## 🧪 Testing

```bash
cd server
npm test          # Vitest (eligibility engine — 8 tests, all passing)
```

Tests cover:
- Country-specific restrictions
- Conflicting and missing regulatory data
- Repatriation conditions
- Illustrative vs verified rule flags

---

## 📡 API Reference

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Register user | Public |
| `/api/auth/login` | POST | Login (sets httpOnly cookies) | Public |
| `/api/auth/me` | GET | Current user + profile | Required |
| `/api/profile` | GET/PUT | User profile | Required (owner) |
| `/api/eligibility/check` | POST | Run eligibility check | Optional |
| `/api/eligibility/history` | GET | User's check history | Required |
| `/api/investments/categories` | GET | List 9 investment categories | Optional |
| `/api/rules` | GET/POST/DELETE | Eligibility rules | Required / Admin |
| `/api/sources` | GET | Regulatory sources | Required |
| `/api/assistant/chat` | POST | AI assistant chat | Optional |
| `/api/checklists` | GET/POST | User checklists | Required |
| `/api/checklists/:id/items` | POST/PUT/DELETE | Checklist items | Required |
| `/api/tax/estimate` | POST | Illustrative tax estimate | Optional |
| `/api/saved-investments` | GET/POST/DELETE | Saved investments | Required |
| `/api/admin/unresolved-checks` | GET | Unresolved cases | Admin |
| `/api/admin/updates` | GET/POST | Regulatory updates | Admin |

---

## 👤 Admin Panel

Restricted to users with `role = "ADMIN"`.

- Add, edit, and delete eligibility rules
- Attach official source URLs and record effective dates
- Mark rules as `VERIFIED`, `PENDING`, `OUTDATED`, or `ILLUSTRATIVE`
- Review unresolved eligibility cases
- Publish regulatory updates

Demo admin: `admin@nrisimplifier.local` / `AdminChangeMe123!`

---

## 🚀 Deployment

### Backend (Render / Railway / Fly.io)
```bash
cd server
npm run build          # Compile TypeScript
npm start              # Run compiled build
```

### Frontend (Vercel / Netlify)
```bash
cd web
npm run build          # Production build to dist/
npm run preview        # Preview locally
```

Set `VITE_*` variables as needed and point the frontend `API_BASE` to your backend URL.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "feat: add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## ⚠ Disclaimer

**NRI Investment Simplifier is for educational purposes only.**

- This platform does **not** provide investment, legal, or tax advice.
- Eligibility rules include demonstration ("ILLUSTRATIVE") data that is **not current law**.
- Verified rules carry official source URLs and verification dates — always confirm with an authorized financial institution (bank, SEBI-registered broker, or mutual fund distributor) before investing.
- Tax estimates are illustrative and versioned; they are **not** a definitive tax liability.
- Consult a qualified financial adviser, tax professional, or the relevant authority (RBI, SEBI, Income Tax Department of India, or your country of residence's tax authority) before making investment decisions.

---

<div align="center">

**Built with ❤️ for the NRI community**

[Joseph Jonathan Fernandes](https://github.com/JosephJonathanFernandes)

</div>
