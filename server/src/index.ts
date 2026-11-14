import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { db, usePrisma } from './db';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import { seedDemoData } from './seed';
import eligibilityRoutes from './routes/eligibility';
import investmentRoutes from './routes/investments';
import rulesRoutes from './routes/rules';
import sourcesRoutes from './routes/sources';
import assistantRoutes from './routes/assistant';
import checklistRoutes from './routes/checklist';
import taxRoutes from './routes/tax';
import savedRoutes from './routes/savedInvestments';
import adminRoutes from './routes/admin';
import { validateCsrfToken } from './middleware/csrf';

// Health check
import { Request, Response } from 'express';

const app = express();

// Trust proxy (for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// Security & CORS
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// CSRF protection for all state-changing requests
app.use(validateCsrfToken);

// Request logging (dev)
if (config.nodeEnv === 'development') {
  app.use((req: Request, _res: Response, next) => {
    // eslint-disable-next-line no-console
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'nri-investment-simplifier-server',
    env: config.nodeEnv,
    db: (db as any).constructor?.name || 'db',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/saved-investments', savedRoutes);
app.use('/api/admin', adminRoutes);

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'not_found', message: 'Route not found.' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: Function) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.error || 'internal_server_error',
    message: err.message || 'An unexpected error occurred.',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {}),
  });
});

export function createServer(port: number = config.port) {
  const server = app.listen(port, async () => {
    await db.$connect();
    // Auto-seed demonstration data when using the in-memory store.
    if (!usePrisma) {
      try {
        await seedDemoData();
      } catch (err) {
        console.warn('[seed] Auto-seed failed:', (err as Error).message);
      }
    }
    const addr = server.address() as { port: number };
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${addr.port} (${config.nodeEnv})`);
  });
  return server;
}

const server = createServer();

export default server;
