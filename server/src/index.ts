import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';
import { config } from './config';
import { db, usePrisma } from './db';
import { logger } from './logger';

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

const app = express();

// Trust proxy (for rate limiting behind reverse proxies)
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Sentry initialization (must be before other middleware)
// ---------------------------------------------------------------------------
if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.nodeEnv,
    release: 'nri-investment-simplifier@1.0.0',
    tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ---------------------------------------------------------------------------
// Security & CORS
// ---------------------------------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ---------------------------------------------------------------------------
// CSRF protection for all state-changing requests
// ---------------------------------------------------------------------------
app.use(validateCsrfToken);

// ---------------------------------------------------------------------------
// Simple request logging using pino
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP request', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: (req as any).user?.userId,
      ip: req.ip,
    });
  });
  next();
});

// ---------------------------------------------------------------------------
// Health check endpoints
// ---------------------------------------------------------------------------

// Liveness probe - service is running
app.get('/api/health/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive', service: 'nri-investment-simplifier-server' });
});

// Readiness probe - service is ready to serve requests
app.get('/api/health/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Check database connectivity
  try {
    await db.$connect();
    checks.database = 'connected';
  } catch (err) {
    checks.database = 'disconnected';
    healthy = false;
    logger.error('Database health check failed', { error: err });
  }

  // Check Prisma status
  checks.prisma = usePrisma ? 'connected' : 'in-memory';

  if (healthy) {
    res.status(200).json({ status: 'ready', checks });
  } else {
    res.status(503).json({ status: 'unready', checks });
  }
});

// Full health check (combined liveness + readiness)
app.get('/api/health', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  try {
    await db.$connect();
    checks.database = 'connected';
  } catch (err) {
    checks.database = 'disconnected';
    healthy = false;
    logger.error('Health check database failed', { error: err });
  }

  checks.prisma = usePrisma ? 'connected' : 'in-memory';

  if (healthy) {
    res.json({
      status: 'ok',
      service: 'nri-investment-simplifier-server',
      env: config.nodeEnv,
      version: '1.0.0',
      checks,
    });
  } else {
    res.status(503).json({
      status: 'unhealthy',
      service: 'nri-investment-simplifier-server',
      env: config.nodeEnv,
      checks,
    });
  }
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Sentry error handler (must be before other error handlers)
// ---------------------------------------------------------------------------
if (config.sentryDsn) {
  app.use(Sentry.Handlers.errorHandler());
}

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------
app.use((_req: Request, res: Response) => {
  logger.warn('Route not found', { path: _req.originalUrl, method: _req.method });
  res.status(404).json({ error: 'not_found', message: 'Route not found.' });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err: any, _req: Request, res: Response, _next: Function) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    status: err.status || 500,
  });

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
        logger.warn('[seed] Auto-seed failed', { error: err });
      }
    }
    const addr = server.address() as { port: number };
    logger.info('Server started', { port: addr.port, env: config.nodeEnv });
  });
  return server;
}

const server = createServer();

export default server;