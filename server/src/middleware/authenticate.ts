import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from '../utils/app-error.js';

/**
 * Requires a valid `Authorization: Bearer <accessToken>` header and attaches the
 * decoded payload to `req.user`. Fails closed with 401 on any problem.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(AppError.unauthorized('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(AppError.unauthorized('Invalid or expired access token'));
  }
};
