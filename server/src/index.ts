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
import { rateLimitMiddleware } from './middleware/rateLimit';
import { openapiSpec } from './openapi';

const app = express();

// ---------------------------------------------------------------------------
// OpenAPI documentation
// ---------------------------------------------------------------------------
app.get('/api/docs/openapi.json', (_req: Request, res: Response) => {
  res.json(openapiSpec);
});

app.get('/api/docs', (_req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html>
  <head>
    <title>NRI Investment Simplifier API Docs</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
      body, .swagger-ui * { margin: 0; padding: 0; box-sizing: border-box; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { font-size: 2em; font-weight: 600; color: #1a202c; }
      .swagger-ui .info .description { color: #4a5568; font-size: 1rem; margin-bottom: 1rem; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script>
      const ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'StandaloneLayout',
      });
      window.ui = ui;
    </script>
  </body>
</html>
`);
});

// ---------------------------------------------------------------------------
// Trust proxy (for rate limiting behind reverse proxies)
// ---------------------------------------------------------------------------
app.set('trust proxy', 1);

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------
function validateEnvironment(): void {
  const required: string[] = [];
  const warnings: string[] = [];

  if (!config.jwtAccessSecret || config.jwtAccessSecret === 'dev-access-secret-change-me') {
    required.push('JWT_ACCESS_SECRET');
  }
  if (!config.jwtRefreshSecret || config.jwtRefreshSecret === 'dev-refresh-secret-change-me') {
    required.push('JWT_REFRESH_SECRET');
  }
  if (!config.adminPassword || config.adminPassword === 'AdminChangeMe123!') {
    warnings.push('ADMIN_PASSWORD');
  }
  if (!config.sentryDsn) {
    warnings.push('SENTRY_DSN');
  }

  // Skip required env var check in test mode
  if (required.length > 0 && config.nodeEnv !== 'test') {
    throw new Error(
      `Missing required environment variables: ${required.join(', ')}`
    );
  }
  if (required.length > 0) {
    logger.warn('Missing required environment variables (test mode)', {
      missing: required,
    });
  }

  if (warnings.length > 0 && config.nodeEnv === 'production') {
    throw new Error(
      `Missing recommended production environment variables: ${warnings.join(', ')}`
    );
  }

  if (warnings.length > 0) {
    logger.warn('Missing optional environment variables', { missing: warnings });
  }
}

validateEnvironment();

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
// Request logging using pino
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

  // Graceful shutdown
  const shutdownSignals: Array<NodeJS.Signals> = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      try {
        await server.close();
        await db.$disconnect();
        logger.info('Graceful shutdown complete');
        process.exit(0);
      } catch (err) {
        logger.error('Error during graceful shutdown', { error: err });
        process.exit(1);
      }
    });
  });

  return server;
}

const server = createServer();

export default server;