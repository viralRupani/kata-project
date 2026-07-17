import type { AccessTokenPayload } from '../utils/jwt.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Populated by the authenticate middleware from a valid access token. */
      user?: AccessTokenPayload;
    }
  }
}

export {};
