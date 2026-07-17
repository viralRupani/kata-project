import { beforeAll, afterAll } from 'vitest';
import { execSync } from 'node:child_process';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';

/**
 * Test harness. Points Prisma at the dedicated test database (via NODE_ENV=test +
 * TEST_DATABASE_URL) and ensures the schema is applied once before the suite runs.
 * Per-test isolation (truncation) is handled by `resetDb()` in helpers.ts.
 */
beforeAll(() => {
  const url = env.TEST_DATABASE_URL ?? env.DATABASE_URL;
  // Apply the current schema to the test DB. `db push` keeps the test DB in sync
  // with schema.prisma without needing a migration history.
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});
