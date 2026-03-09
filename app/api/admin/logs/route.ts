import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const logs = await prisma.auditLog.findMany({
            include: { user: { select: { name: true, email: true } } },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        return NextResponse.json({ logs }, { status: 200 });
    } catch (error: any) {
        console.error('[ADMIN_LOGS_GET_ERROR]', error.message || error);
        return NextResponse.json(
            { error: 'Failed to fetch admin logs', details: error.message },
            { status: 500 }
        );
    }
}
