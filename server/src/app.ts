import express, { type Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { vehiclesRouter } from './modules/vehicles/vehicles.routes.js';

/**
 * Builds the Express application. Exported (without calling listen) so tests can
 * drive it directly with Supertest.
 */
export const createApp = (): Express => {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true, // allow the refresh-token cookie
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/vehicles', vehiclesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
