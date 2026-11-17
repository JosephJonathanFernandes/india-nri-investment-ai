import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { config } from './config';

/**
 * Production-ready structured logger using pino.
 *
 * In development: pretty-printed, colorful logs to console.
 * In production: JSON logs to stdout (suitable for log aggregation systems).
 */
const isDevelopment = config.nodeEnv === 'development';

const transport = isDevelopment
  ? pinoPretty({
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
      messageKey: 'msg',
      levelFirst: true,
    })
  : undefined;

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
    redact: {
      paths: [
        'req.headers.authorization',
        'req.cookies.access_token',
        'req.cookies.refresh_token',
        'res.headers.set-cookie',
        'body.password',
        'body.passwordHash',
      ],
      remove: true,
    },
    base: {
      service: 'nri-investment-simplifier-server',
      env: config.nodeEnv,
      version: '1.0.0',
    },
  },
  transport ? pino.multidest([transport, pino.destination(process.stdout)]) : pino.destination(process.stdout)
);

export type Logger = typeof logger;

export default logger;
