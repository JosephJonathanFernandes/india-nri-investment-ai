import { Request, Response, NextFunction } from 'express';
import { db } from '../db';

/**
 * Audit logging middleware.
 *
 * Automatically logs state-changing requests (POST/PUT/DELETE/PATCH) to the
 * AuditLog table. Captures the authenticated user, action type, entity type,
 * entity ID (from req.params.id or req.body), and request body metadata.
 *
 * Usage:
 *   router.post('/users', requireAuth, auditLog('CREATE', 'User'), createUser);
 *   router.put('/users/:id', requireAuth, auditLog('UPDATE', 'User'), updateUser);
 *   router.delete('/users/:id', requireAuth, auditLog('DELETE', 'User'), deleteUser);
 */
export function auditLog(action: string, entity: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Capture the original res.json to intercept the response
    const originalJson = res.json.bind(res);
    res.json = function (body: any): Response {
      // Only log successful mutations (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId =
          req.params.id ||
          body?.id ||
          body?.userId ||
          body?.categoryId ||
          body?.checklistId ||
          body?.ruleId ||
          null;

        db.createAuditLog({
          action,
          entity,
          entityId,
          userId: (req as any).user?.userId ?? null,
          metadata: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: { ...req.body, password: undefined, passwordHash: undefined }, // redact secrets
            response: body,
          },
        }).catch(() => {
          // Audit logging should never break the request
          console.error('Failed to write audit log');
        });
      }
      return originalJson.call(res, body);
    };

    next();
  };
}
