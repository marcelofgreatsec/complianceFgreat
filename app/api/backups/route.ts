import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const backupsList = await prisma.backups.findMany({
            include: { asset: true },
            orderBy: { backupDate: 'desc' }
        });
        return NextResponse.json(backupsList);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar backups' }, { status: 500 });
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

        const newBackup = await prisma.backups.create({
            data: {
                assetId,
                backupDate: new Date(backupDate),
                size,
                status: status || 'Pendente'
            }
        });

        return NextResponse.json(newBackup);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao criar registro de backup' }, { status: 500 });
    }
}
