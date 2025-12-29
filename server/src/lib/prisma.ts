import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create Prisma client if DATABASE_URL is set
let prismaClient: PrismaClient | null = null;

if (process.env.DATABASE_URL) {
  prismaClient = globalForPrisma.prisma ?? new PrismaClient();
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
  }
} else {
  console.warn('⚠️ DATABASE_URL not set - authentication features disabled');
}

export const prisma = prismaClient;
export const isDatabaseEnabled = !!prismaClient;
