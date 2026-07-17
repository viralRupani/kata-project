import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { loginSchema, registerSchema } from './auth.schema.js';
import { login, logout, me, refresh, register } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(register));
authRouter.post('/login', validate(loginSchema), asyncHandler(login));
authRouter.post('/refresh', asyncHandler(refresh));
authRouter.post('/logout', asyncHandler(logout));
authRouter.get('/me', authenticate, asyncHandler(me));
