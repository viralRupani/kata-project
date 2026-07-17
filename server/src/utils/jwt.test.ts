import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './jwt.js';

describe('jwt utils', () => {
  it('round-trips an access token payload', () => {
    const token = signAccessToken({ sub: 'u1', email: 'a@b.com', role: 'ADMIN' });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('u1');
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.role).toBe('ADMIN');
  });

  it('round-trips a refresh token payload', () => {
    const token = signRefreshToken({ sub: 'u1', jti: 'j1' });
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe('u1');
    expect(decoded.jti).toBe('j1');
  });

  it('rejects a tampered/invalid access token', () => {
    expect(() => verifyAccessToken('not.a.token')).toThrow();
  });
});
