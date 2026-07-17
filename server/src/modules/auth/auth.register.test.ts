import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app.js';
import { resetDb } from '../../tests/helpers.js';
import { prisma } from '../../lib/prisma.js';

const app = createApp();

describe('POST /api/auth/register', () => {
  beforeEach(resetDb);

  it('registers a new user with the USER role and does not leak the password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane@example.com',
      name: 'Jane Doe',
      password: 'Password@123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: 'jane@example.com',
      name: 'Jane Doe',
      role: 'USER',
    });
    expect(res.body.user.id).toBeTruthy();
    // Sensitive fields must never be returned.
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.body.user.password).toBeUndefined();

    const stored = await prisma.user.findUnique({ where: { email: 'jane@example.com' } });
    expect(stored?.passwordHash).toBeTruthy();
    expect(stored?.passwordHash).not.toBe('Password@123'); // stored hashed
  });

  it('rejects a duplicate email with 409', async () => {
    const payload = { email: 'dup@example.com', name: 'Dup', password: 'Password@123' };
    await request(app).post('/api/auth/register').send(payload).expect(201);

    const res = await request(app).post('/api/auth/register').send(payload);
    expect(res.status).toBe(409);
  });

  it('rejects invalid input with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', name: '', password: '123' });
    expect(res.status).toBe(400);
  });
});
