import { PrismaClient } from '@prisma/client';
import { isTest, env } from '../config/env.js';

/**
 * A single shared PrismaClient. In test mode it points at TEST_DATABASE_URL so
 * integration tests never touch the development database.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: isTest && env.TEST_DATABASE_URL ? env.TEST_DATABASE_URL : env.DATABASE_URL,
    },
  },
});
