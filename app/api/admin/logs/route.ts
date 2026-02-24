import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

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
    } catch (error) {
        console.error('Error fetching admin logs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch admin logs' },
            { status: 500 }
        );
    }
}
