import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function log(params: {
    action: string
    table: string
    recordId?: string
    request: Request
}) {
    try {
        const supabase = await createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const ip = params.request.headers.get('x-forwarded-for') || 'unknown'

        await prisma.auditLog.create({
            data: {
                userId: session?.user?.id || null,
                action: params.action,
                tableName: params.table,
                resource: params.recordId ? `${params.table}:${params.recordId}` : params.table,
                ipAddress: ip
            }
        })
    } catch (e) {
        console.error('Audit log failed:', e)
    }
}
