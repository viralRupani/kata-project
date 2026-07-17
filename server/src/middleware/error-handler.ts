import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app-error.js';
import { isProd } from '../config/env.js';

/** 404 fallthrough for unmatched routes. */
export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(AppError.notFound('Route not found'));
};

/**
 * Centralized error middleware. Every thrown/forwarded error lands here and is
 * rendered as a consistent JSON envelope.
 */
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (!isProd) {
    // Surface unexpected errors in dev/test to aid debugging.
    console.error(err);
  }

  res.status(500).json({ error: 'Internal server error' });
};
