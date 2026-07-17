import type { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service.js';
import { rotateRefreshToken, revokeRefreshToken } from './token.service.js';
import { REFRESH_COOKIE, clearRefreshCookie, setRefreshCookie } from './auth.cookie.js';
import { AppError } from '../../utils/app-error.js';

/** POST /api/auth/register — thin controller; validation + logic live elsewhere. */
export const register = async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  res.status(201).json({ user });
};

/** POST /api/auth/login — returns access token in the body, refresh token as a cookie. */
export const login = async (req: Request, res: Response) => {
  const { user, tokens } = await loginUser(req.body);
  setRefreshCookie(res, tokens.refreshToken);
  res.status(200).json({ user, accessToken: tokens.accessToken });
};

/** POST /api/auth/refresh — rotates the refresh cookie and returns a new access token. */
export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw AppError.unauthorized('Missing refresh token');

  const tokens = await rotateRefreshToken(token);
  setRefreshCookie(res, tokens.refreshToken);
  res.status(200).json({ accessToken: tokens.accessToken });
};

/** POST /api/auth/logout — revokes the refresh token and clears the cookie. */
export const logout = async (req: Request, res: Response) => {
  await revokeRefreshToken(req.cookies?.[REFRESH_COOKIE]);
  clearRefreshCookie(res);
  res.status(200).json({ message: 'Logged out' });
};
