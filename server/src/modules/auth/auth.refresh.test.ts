import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, createUser } from '../../tests/helpers.js';

const app = createApp();

/** Logs in and returns the refresh cookie string for reuse across requests. */
const loginAndGetCookie = async (email: string, password: string): Promise<string> => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  const cookies = res.headers['set-cookie'] as unknown as string[];
  return cookies.find((c) => c.startsWith('refreshToken='))!.split(';')[0];
};

describe('POST /api/auth/refresh', () => {
  beforeEach(resetDb);

  it('issues a new access token from a valid refresh cookie', async () => {
    await createUser({ email: 'r@example.com', password: 'Password@123' });
    const cookie = await loginAndGetCookie('r@example.com', 'Password@123');

    const res = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
    // Rotation: a brand-new refresh cookie is set.
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects a request with no refresh cookie (401)', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('rejects a rotated (already-used) refresh token — one-time use', async () => {
    await createUser({ email: 'r@example.com', password: 'Password@123' });
    const cookie = await loginAndGetCookie('r@example.com', 'Password@123');

    // First use rotates it.
    await request(app).post('/api/auth/refresh').set('Cookie', cookie).expect(200);
    // Reusing the old token must fail.
    const reuse = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(reuse.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  beforeEach(resetDb);

  it('revokes the refresh token so it can no longer be refreshed', async () => {
    await createUser({ email: 'r@example.com', password: 'Password@123' });
    const cookie = await loginAndGetCookie('r@example.com', 'Password@123');

    const res = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(res.status).toBe(200);

    const afterLogout = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(afterLogout.status).toBe(401);
  });
});
