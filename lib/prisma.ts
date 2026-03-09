import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const pool = new Pool({
    // No Vercel, o DATABASE_URL aponta para o Supabase Connection Pooler (Pgbouncer), o que previne "Connection terminated unexpectedly"
    connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
    ssl: {
        rejectUnauthorized: false
    }
})
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });


