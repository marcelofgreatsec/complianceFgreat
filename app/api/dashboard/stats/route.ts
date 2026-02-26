import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    try {
        // Buscar logs dos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .select('created_at, action')
            .gte('created_at', thirtyDaysAgo.toISOString())
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Processar dados para o formato do Recharts
        const historyMap: Record<string, { date: string, ok: number, falha: number }> = {};

        // Inicializar os últimos 30 dias com zero
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            historyMap[dateStr] = { date: dateStr, ok: 0, falha: 0 };
        }

        // Preencher com dados reais
        data?.forEach((log: any) => {
            const dateStr = new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (historyMap[dateStr]) {
                if (log.action.includes('error') || log.action.includes('fail')) {
                    historyMap[dateStr].falha++;
                } else {
                    historyMap[dateStr].ok++;
                }
            }
        });

        const history = Object.values(historyMap);

        return NextResponse.json({ history });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Erro ao carregar estatísticas' }, { status: 500 });
    }
}
