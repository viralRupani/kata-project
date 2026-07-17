import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { registerSchema } from './auth.schema.js';
import { register } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), asyncHandler(register));
