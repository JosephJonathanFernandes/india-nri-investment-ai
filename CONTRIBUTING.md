# Contributing to NRI Investment Simplifier

Thank you for considering a contribution! Please read this guide before submitting pull requests.

## How to Contribute

1. **Fork the repository** and clone your fork locally.
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit with conventional commit messages:
   ```bash
   git commit -m "feat: add eligibility rule for GIFT City products"
   ```
   Allowed prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `security`.
4. **Push to your fork** and open a Pull Request against `main`.

## Development Workflow

### Backend
```bash
cd server
npm install
cp ../.env.example .env   # configure your values
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend
```bash
cd web
npm install
npm run dev
```

### Testing
```bash
cd server
npm test
```

## Code Style

- Use TypeScript strict mode.
- Prefer named exports for reusable components; default exports for pages.
- Follow the existing Tailwind class ordering and color palette (navy, white, emerald).
- Keep accessibility in mind (aria-labels, keyboard navigation, color contrast).
- All new API endpoints must include input validation and consistent error responses.

## Regulatory Contributions

If you are adding or editing eligibility rules:

- Provide an official source URL (RBI, SEBI, Income Tax Department, Ministry of Finance, etc.).
- Set `reviewStatus` to `PENDING` until verified by a maintainer.
- Never fabricate laws, regulations, URLs, or citations.
- Mark unverified rules as `ILLUSTRATIVE` — never as current law.
- Include `effectiveDate` and `lastVerified` timestamps.

## Pull Request Checklist

- [ ] TypeScript compiles cleanly (`tsc --noEmit`)
- [ ] Backend tests pass (`npm test`)
- [ ] Frontend builds successfully (`npm run build`)
- [ ] No secrets or API keys committed
- [ ] Regulatory rules include source URLs and review status

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
