import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb, createUser } from '../../tests/helpers.js';

const app = createApp();

describe('GET /api/auth/me', () => {
  beforeEach(resetDb);

  it('returns the authenticated user', async () => {
    const { accessToken } = await createUser({ email: 'me@example.com', role: 'ADMIN' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: 'me@example.com', role: 'ADMIN' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects an unauthenticated request with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
