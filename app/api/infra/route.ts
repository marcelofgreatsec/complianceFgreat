import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const diagrams = await prisma.infrastructure.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(diagrams);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar diagramas' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const { id, name, data } = await req.json();

        const diagram = id ? await prisma.infrastructure.upsert({
            where: { id },
            update: { name, data, updatedAt: new Date() },
            create: { name, data }
        }) : await prisma.infrastructure.create({
            data: { name, data }
        });

        return NextResponse.json(diagram);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao salvar diagrama' }, { status: 500 });
    }
}
