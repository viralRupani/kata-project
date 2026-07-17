import type { Response } from 'express';
import { isProd } from '../../config/env.js';

export const REFRESH_COOKIE = 'refreshToken';

/**
 * Cookie options for the refresh token. HttpOnly so JS can't read it (XSS-safe),
 * SameSite=lax, and Secure in production. Scoped to the refresh/logout routes.
 */
const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax' as const,
  path: '/api/auth',
};

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE, baseOptions);
};
