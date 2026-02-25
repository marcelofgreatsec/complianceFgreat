import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { InfrastructureSchema } from '@/lib/validators';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

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

        const body = await req.json();
        const validatedData = InfrastructureSchema.parse(body);
        const { id, name, data } = validatedData;

        const diagram = id ? await prisma.infrastructure.upsert({
            where: { id },
            update: { name: name!, data: data!, updatedAt: new Date() },
            create: { name: name!, data: data! }
        }) : await prisma.infrastructure.create({
            data: { name: name!, data: data! }
        });

        return NextResponse.json(diagram);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro ao salvar diagrama' }, { status: 500 });
    }
}
