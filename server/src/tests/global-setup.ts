import { execSync } from 'node:child_process';
import { env } from '../config/env.js';

/**
 * Runs ONCE for the whole test run (not per file). Applies the current Prisma
 * schema to the dedicated test database so integration tests have real tables.
 */
export default function globalSetup() {
  const url = env.TEST_DATABASE_URL ?? env.DATABASE_URL;
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  });
}
