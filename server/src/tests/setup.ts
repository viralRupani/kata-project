import { afterAll } from 'vitest';
import { prisma } from '../lib/prisma.js';

/**
 * Per-file teardown. The schema is applied once in global-setup.ts; per-test
 * isolation is handled by `resetDb()` in helpers.ts.
 */
afterAll(async () => {
  await prisma.$disconnect();
});
