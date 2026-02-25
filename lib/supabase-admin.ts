import { createClient } from '@supabase/supabase-js'

// Criação de um cliente Supabase com a Service Role Key para contornar o RLS em operações críticas como Audit
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)
