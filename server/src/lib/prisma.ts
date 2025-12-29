import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create Prisma client if DATABASE_URL is set
let prismaClient: PrismaClient | null = null;
let dbEnabled = false;

try {
  if (process.env.DATABASE_URL) {
    prismaClient = globalForPrisma.prisma ?? new PrismaClient();
    dbEnabled = true;
    
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prismaClient;
    }
    console.log('✅ Database connection configured');
  } else {
    console.warn('⚠️ DATABASE_URL not set - authentication features disabled');
  }
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error);
  prismaClient = null;
  dbEnabled = false;
}

export const prisma = prismaClient;
export const isDatabaseEnabled = dbEnabled;
