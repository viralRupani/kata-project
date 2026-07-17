import type { User } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { hashPassword } from '../../utils/password.js';
import { AppError } from '../../utils/app-error.js';
import type { RegisterInput } from './auth.schema.js';

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
