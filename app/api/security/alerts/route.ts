import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Admin/TI check
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('security_alerts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar alertas' }, { status: 500 });
    }
}
