export const config = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-me',
  jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY ?? '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY ?? '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@nrisimplifier.local',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'AdminChangeMe123!',

  // Security settings
  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH ?? '12', 10),
  passwordRequireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
  passwordRequireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
  passwordRequireNumber: process.env.PASSWORD_REQUIRE_NUMBER !== 'false',
  passwordRequireSymbol: process.env.PASSWORD_REQUIRE_SYMBOL !== 'false',
  lockoutMaxAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS ?? '5', 10),
  lockoutDurationMs: parseInt(process.env.LOCKOUT_DURATION_MS ?? '900000', 10), // 15 minutes
};
