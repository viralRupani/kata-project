import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type Role = 'USER' | 'ADMIN';

export interface AccessTokenPayload {
  sub: string; // user id
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  sub: string; // user id
  jti: string; // token id (matches a RefreshToken row)
}

/** Signs a short-lived access token carrying identity + role. */
export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL });

/** Signs a long-lived refresh token bound to a persisted token id (jti). */
export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL });

/** Verifies an access token, throwing if invalid/expired. */
export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

/** Verifies a refresh token, throwing if invalid/expired. */
export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
