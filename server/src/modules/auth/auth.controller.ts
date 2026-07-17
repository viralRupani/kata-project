import type { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service.js';
import { setRefreshCookie } from './auth.cookie.js';

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
