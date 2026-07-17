import { randomUUID } from 'node:crypto';
import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { sha256 } from '../../utils/crypto.js';
import { AppError } from '../../utils/app-error.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import { env } from '../../config/env.js';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

/** Milliseconds until a refresh token expires, derived from the configured TTL. */
const refreshTtlMs = (): number => {
  const ttl = env.JWT_REFRESH_TTL;
  const match = /^(\d+)([smhd])$/.exec(ttl);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const value = Number(match[1]);
  const unit = match[2];
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit]!;
  return value * factor;
};

/**
 * Issues a fresh access token and a persisted refresh token for a user. Each
 * refresh token is tied to a DB row (jti) and stored hashed.
 */
export const issueTokens = async (user: User): Promise<IssuedTokens> => {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });

  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  await prisma.refreshToken.create({
    data: {
      id: jti,
      tokenHash: sha256(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTtlMs()),
    },
  });

  return { accessToken, refreshToken };
};

/**
 * Validates a refresh token against its stored, unrevoked, unexpired row and
 * rotates it: the old row is revoked and a brand-new token pair is issued. This
 * gives one-time-use refresh tokens (reuse of a rotated token fails).
 */
export const rotateRefreshToken = async (rawToken: string): Promise<IssuedTokens> => {
  let payload;
  try {
    payload = verifyRefreshToken(rawToken);
  } catch {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (
    !stored ||
    stored.revokedAt ||
    stored.expiresAt < new Date() ||
    stored.tokenHash !== sha256(rawToken)
  ) {
    throw AppError.unauthorized('Invalid refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user) throw AppError.unauthorized('Invalid refresh token');

  // Revoke the used token, then issue a new pair (rotation).
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(user);
};

/** Revokes a refresh token (logout). Silent if the token is missing/invalid. */
export const revokeRefreshToken = async (rawToken: string | undefined): Promise<void> => {
  if (!rawToken) return;
  try {
    const payload = verifyRefreshToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Invalid token → nothing to revoke.
  }
};
