import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const backups = await prisma.backup.findMany({
            include: { asset: true },
            orderBy: { backupDate: 'desc' }
        });
        return NextResponse.json(backups);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar rotinas' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { assetId, backupDate, size, status } = body;

        const backup = await prisma.backup.create({
            data: {
                assetId,
                backupDate: new Date(backupDate),
                size,
                status: status || 'Pendente'
            }
        });

        return NextResponse.json(backup);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar rotina' }, { status: 500 });
    }
}
