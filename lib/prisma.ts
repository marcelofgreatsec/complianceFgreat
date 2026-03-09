import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// No Vercel, o DATABASE_URL aponta para o Supabase Connection Pooler (Pgbouncer), o que previne "Connection terminated unexpectedly"
// Força o uso do PgBouncer (porta 6543) se estiver apontando para a porta direta (5432) do Supabase
let connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";
if (connectionString.includes('supabase.co:5432')) {
    connectionString = connectionString.replace(':5432', ':6543');
    if (!connectionString.includes('?')) connectionString += '?pgbouncer=true';
    else if (!connectionString.includes('pgbouncer=true')) connectionString += '&pgbouncer=true';
}

const pool = new Pool({
    connectionString,
    max: 5, // Limita as conexões por function do Vercel
    ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });


