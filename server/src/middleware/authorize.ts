import type { NextFunction, Request, Response } from 'express';
import type { Role } from '../utils/jwt.js';
import { AppError } from '../utils/app-error.js';

/**
 * Role gate. Must run after `authenticate`. Fails closed: no user → 401,
 * insufficient role → 403.
 */
export const authorize =
  (...allowed: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!allowed.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
