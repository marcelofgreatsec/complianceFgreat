import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }
        const { name, icon } = await req.json();
        const cat = await prisma.docCategory.update({ where: { id }, data: { name, icon } });
        return NextResponse.json(cat);
    } catch (e: any) {
        console.error('[DOC_CAT_PUT_ERROR]', e.message || e);
        return NextResponse.json({ error: 'Erro ao atualizar categoria', details: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Apenas Admin pode excluir' }, { status: 403 });
        }
        await prisma.docCategory.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error('[DOC_CAT_DELETE_ERROR]', e.message || e);
        return NextResponse.json({ error: 'Erro ao excluir categoria', details: e.message }, { status: 500 });
    }
}
