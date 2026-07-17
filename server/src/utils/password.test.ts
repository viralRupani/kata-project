import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('password utils', () => {
  it('hashes a password to something other than the plaintext', async () => {
    const hash = await hashPassword('Password@123');
    expect(hash).not.toBe('Password@123');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('verifies a correct password', async () => {
    const hash = await hashPassword('Password@123');
    expect(await verifyPassword('Password@123', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('Password@123');
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
