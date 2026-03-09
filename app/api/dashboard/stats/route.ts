import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Buscar logs dos últimos 30 dias via Prisma
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const logs = await prisma.auditLog.findMany({
            where: {
                timestamp: {
                    gte: thirtyDaysAgo
                }
            },
            select: {
                timestamp: true,
                action: true
            },
            orderBy: {
                timestamp: 'asc'
            }
        });

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
        logs.forEach((log) => {
            const dateStr = new Date(log.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (historyMap[dateStr]) {
                const actionLower = log.action.toLowerCase();
                if (actionLower.includes('error') || actionLower.includes('fail') || actionLower.includes('invalid')) {
                    historyMap[dateStr].falha++;
                } else {
                    historyMap[dateStr].ok++;
                }
            }
        });

        const history = Object.values(historyMap);

        return NextResponse.json({ history });
    } catch (error: any) {
        console.error('[STATS_API_ERROR]', error.message || error);
        return NextResponse.json({ error: 'Erro ao carregar estatísticas', details: error.message }, { status: 500 });
    }
}
