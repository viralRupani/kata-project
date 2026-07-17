import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../utils/password.js';
import { signAccessToken, type Role } from '../utils/jwt.js';

/** Truncates all tables so each test starts from a clean slate. */
export const resetDb = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "refresh_tokens", "vehicles", "users" RESTART IDENTITY CASCADE',
  );
};

/** Creates a user directly in the DB and returns it plus a valid access token. */
export const createUser = async (
  overrides: { email?: string; name?: string; password?: string; role?: Role } = {},
) => {
  const email = overrides.email ?? `user-${Date.now()}-${Math.random()}@test.dev`;
  const user = await prisma.user.create({
    data: {
      email,
      name: overrides.name ?? 'Test User',
      passwordHash: await hashPassword(overrides.password ?? 'Password@123'),
      role: overrides.role ?? 'USER',
    },
  });
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  return { user, accessToken };
};

/** Convenience: an authorization header for a freshly created user of the given role. */
export const authHeaderFor = async (role: Role = 'USER') => {
  const { accessToken } = await createUser({ role });
  return { Authorization: `Bearer ${accessToken}` };
};
