import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        const user = { id: 'temp-build-id' };


        const doc = await prisma.document.findUnique({
            where: { id },
            include: { category: true, accessLogs: { orderBy: { timestamp: 'desc' }, take: 10 } },
        });
        if (!doc) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: user?.id, action: 'VIEW' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e: any) {
        console.error('[DOC_GET_ERROR]', e.message || e);
        return NextResponse.json({ error: 'Erro ao buscar documento', details: e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
        //     return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        // }
        const user = { id: 'temp-build-id' };


        const body = await req.json();
        const { credPass, ...rest } = body;

        let encryptedPass: string | undefined;
        if (credPass && credPass !== '••••••••' && rest.type === 'Credencial') {
            encryptedPass = await bcrypt.hash(credPass, 12);
        }

        const doc = await prisma.document.update({
            where: { id },
            data: { ...rest, ...(encryptedPass ? { credPass: encryptedPass } : {}) },
            include: { category: true },
        });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: user.id, action: 'EDIT' },
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e: any) {
        console.error('[DOC_PUT_ERROR]', e.message || e);
        return NextResponse.json({ error: 'Erro ao atualizar documento', details: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (user?.user_metadata?.role !== 'ADMIN') {
        //     return NextResponse.json({ error: 'Apenas Admin pode excluir' }, { status: 403 });
        // }

        await prisma.document.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error('[DOC_DELETE_ERROR]', e.message || e);
        return NextResponse.json({ error: 'Erro ao excluir documento', details: e.message }, { status: 500 });
    }
}
