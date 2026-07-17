import type { Request, Response } from 'express';
import { registerUser } from './auth.service.js';

/** POST /api/auth/register — thin controller; validation + logic live elsewhere. */
export const register = async (req: Request, res: Response) => {
  const user = await registerUser(req.body);
  res.status(201).json({ user });
};
