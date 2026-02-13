export { PrismaClient } from '@prisma/client';
export type { Project, AuditResult, JobStatus } from '@prisma/client';

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/** Singleton Prisma client — prevents connection exhaustion in dev */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
