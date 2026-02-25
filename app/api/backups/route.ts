import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { BackupSchema } from '@/lib/validators';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const backupsList = await prisma.backup.findMany({
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
        const validatedData = BackupSchema.parse(body);
        const { assetId, backupDate, size, status } = validatedData;

        const newBackup = await prisma.backup.create({
            data: {
                assetId: assetId!,
                backupDate: new Date(backupDate),
                size: size!,
                status
            }
        });

        return NextResponse.json(newBackup);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro ao criar registro de backup' }, { status: 500 });
    }
}
