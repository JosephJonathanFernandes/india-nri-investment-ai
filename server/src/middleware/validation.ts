import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

/**
 * Validate request body/query/params against a Zod schema.
 * `source` can be 'body' (default), 'query', or 'params'.
 */
export function validate(schema: z.ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      res.status(400).json({ error: 'validation_error', message: 'Invalid request.', issues });
      return;
    }
    req[source] = result.data as any;
    next();
  };
}

/**
 * Consistent API error helper.
 */
export function apiError(res: Response, status: number, code: string, message: string) {
  res.status(status).json({ error: code, message });
}
