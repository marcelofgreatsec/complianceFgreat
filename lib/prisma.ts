import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL

    // During build time on Vercel, DATABASE_URL might be missing.
    // In Prisma 7, calling new PrismaClient() without a URL in the schema or an adapter/url in options throws.
    // We return a proxy that handles the initialization lazily or returns a dummy during build.
    if (!connectionString && process.env.NODE_ENV === 'production') {
        console.warn('[PRISMA] Skipping initialization: DATABASE_URL is missing.');
        return {} as unknown as PrismaClient;
    }

    const pool = new Pool({
        connectionString: connectionString || 'postgresql://postgres:password@localhost:5432/db',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
