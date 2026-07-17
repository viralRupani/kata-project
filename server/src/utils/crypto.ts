import { createHash } from 'node:crypto';

/**
 * SHA-256 hex digest. Used to store refresh tokens hashed at rest so a DB leak
 * cannot be replayed against the auth endpoints.
 */
export const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');
