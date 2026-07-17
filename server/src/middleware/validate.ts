import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { AppError } from '../utils/app-error.js';

type Part = 'body' | 'query' | 'params';

/**
 * Returns middleware that validates and replaces a request part with the parsed,
 * typed result. Keeps controllers/services free of ad-hoc input checks.
 */
export const validate =
  (schema: ZodSchema, part: Part = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      // req.query/params are read-only getters in Express 5-ish typings; assign safely.
      (req as unknown as Record<Part, unknown>)[part] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(AppError.badRequest('Validation failed', err.flatten().fieldErrors));
        return;
      }
      next(err);
    }
  };
