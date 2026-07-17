import type { AccessTokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      /** Populated by the authenticate middleware from a valid access token. */
      user?: AccessTokenPayload;
    }
  }
}

export {};
