import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';
import { authorize } from './authorize.js';
import { AppError } from '../utils/app-error.js';

const run = (user: Request['user'], ...allowed: ('USER' | 'ADMIN')[]) => {
  const req = { user } as Request;
  const res = {} as Response;
  const next = vi.fn();
  authorize(...allowed)(req, res, next);
  return next;
};

describe('authorize middleware', () => {
  it('calls next() when the user has an allowed role', () => {
    const next = run({ sub: 'u1', email: 'a@b.com', role: 'ADMIN' }, 'ADMIN');
    expect(next).toHaveBeenCalledWith();
  });

  it('forbids (403) a user whose role is not allowed', () => {
    const next = run({ sub: 'u1', email: 'a@b.com', role: 'USER' }, 'ADMIN');
    const err = next.mock.calls[0][0] as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(403);
  });

  it('fails closed (401) when there is no authenticated user', () => {
    const next = run(undefined, 'ADMIN');
    const err = next.mock.calls[0][0] as AppError;
    expect(err.statusCode).toBe(401);
  });
});
