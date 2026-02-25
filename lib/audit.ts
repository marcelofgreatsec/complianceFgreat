import { supabaseAdmin } from '@/lib/supabase-admin'
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

        await supabaseAdmin.from('audit_logs').insert({
            user_id: session?.user?.id,
            action: params.action,
            table_name: params.table,
            record_id: params.recordId,
            ip_address: ip
        })
    } catch (e) {
        console.error('Audit log failed:', e)
    }
}
