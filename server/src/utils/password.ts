import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/** Hashes a plaintext password with bcrypt. */
export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, SALT_ROUNDS);

/** Verifies a plaintext password against a bcrypt hash. */
export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
