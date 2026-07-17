import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { AppError } from '../../utils/app-error.js';
import { issueTokens, type IssuedTokens } from './token.service.js';
import type { LoginInput, RegisterInput } from './auth.schema.js';

/** A user object safe to return in API responses (no credentials). */
export type PublicUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'createdAt'>;

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  createdAt: user.createdAt,
});

/**
 * Registers a new user. Enforces unique email and always assigns the USER role —
 * privilege escalation is impossible through this endpoint.
 */
export const registerUser = async (input: RegisterInput): Promise<PublicUser> => {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw AppError.conflict('Email is already registered');
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      passwordHash: await hashPassword(input.password),
      role: 'USER',
    },
  });

  return toPublicUser(user);
};

/** Returns the public profile of a user by id, or throws 401 if they no longer exist. */
export const getCurrentUser = async (id: string): Promise<PublicUser> => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw AppError.unauthorized();
  return toPublicUser(user);
};

/**
 * Authenticates a user by email + password. Uses a uniform 401 for both unknown
 * email and wrong password so the endpoint cannot be used to enumerate accounts.
 * On success, issues an access token and a persisted refresh token.
 */
export const loginUser = async (
  input: LoginInput,
): Promise<{ user: PublicUser; tokens: IssuedTokens }> => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const tokens = await issueTokens(user);
  return { user: toPublicUser(user), tokens };
};
