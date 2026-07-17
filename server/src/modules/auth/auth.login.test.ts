import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, createUser } from '../../tests/helpers.js';
import { prisma } from '../../lib/prisma.js';
import { verifyAccessToken } from '../../utils/jwt.js';

const app = createApp();

describe('POST /api/auth/login', () => {
  beforeEach(resetDb);

  it('returns an access token + user and sets an httpOnly refresh cookie', async () => {
    await createUser({ email: 'log@example.com', password: 'Password@123', role: 'ADMIN' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'log@example.com', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'log@example.com', role: 'ADMIN' });
    expect(res.body.accessToken).toBeTruthy();

    // Access token is a real JWT carrying identity + role.
    const decoded = verifyAccessToken(res.body.accessToken);
    expect(decoded.email).toBe('log@example.com');
    expect(decoded.role).toBe('ADMIN');

    // Refresh token is delivered as an httpOnly cookie, not in the body.
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
    expect(cookies.some((c) => /refreshToken=.*HttpOnly/i.test(c))).toBe(true);
    expect(res.body.refreshToken).toBeUndefined();

    // Refresh token is persisted server-side.
    const count = await prisma.refreshToken.count();
    expect(count).toBe(1);
  });

  it('rejects wrong password with 401', async () => {
    await createUser({ email: 'log@example.com', password: 'Password@123' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'log@example.com', password: 'WrongPass@1' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email with 401 (no user enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password@123' });
    expect(res.status).toBe(401);
  });
});
