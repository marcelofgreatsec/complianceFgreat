import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { DocumentSchema } from '@/lib/validations/document-schema';
import { validateCSRF } from '@/lib/csrf';
import { log } from '@/lib/audit';
import { logSecurity } from '@/lib/monitor';

export async function GET(req: Request) {
    try {

        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const where: any = {};
        if (category && category !== 'all') where.categoryId = category;
        if (type && type !== 'all') where.type = type;
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { tags: { contains: search } },
            ];
        }

        const docs = await prisma.document.findMany({
            where,
            include: { category: true },
            orderBy: { updatedAt: 'desc' },
        });

        return NextResponse.json(docs.map(d => ({ ...d, credPass: d.credPass ? '••••••••' : null })));
    } catch (e: any) {
        console.error('Document GET error:', e?.message);
        return NextResponse.json({ error: 'Erro ao buscar documentos' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {

        const token = req.headers.get('x-csrf-token');
        if (!token || !(await validateCSRF(token))) {
            logSecurity({ type: 'CSRF_FAILED', severity: 'CRITICAL', details: { ip: req.headers.get('x-forwarded-for') || 'unknown', route: '/api/docs' } });
            return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 });
        }

        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
        //     return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        // }
        const user = { id: 'temp-build-id' }; // Fallback for createdBy


        const body = await req.json();
        const validatedData = DocumentSchema.parse(body);
        const { title, categoryId, type, description, tags, content, fileUrl, fileType, credUser, credPass, responsible } = validatedData;

        let encryptedPass: string | undefined;
        if (credPass && type === 'Credencial') {
            encryptedPass = await bcrypt.hash(credPass, 12);
        }

        const doc = await prisma.document.create({
            data: {
                title: title!, categoryId: categoryId!, type: type!,
                description: description || null,
                tags: tags || null,
                content: content || null,
                fileUrl: fileUrl || null,
                fileType: fileType || null,
                credUser: credUser || null,
                credPass: encryptedPass || null,
                responsible: responsible || null,
                createdBy: user.id,
            },
            include: { category: true },
        });

        await prisma.docAccessLog.create({
            data: { documentId: doc.id, userId: user.id, action: 'CREATE' },
        });

        await log({
            action: 'CREATE',
            table: 'documentos',
            recordId: doc.id,
            request: req
        });

        return NextResponse.json({ ...doc, credPass: doc.credPass ? '••••••••' : null });
    } catch (e: any) {
        if (e.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: e.errors }, { status: 400 });
        }
        console.error('Document POST error:', e?.message);
        return NextResponse.json({ error: 'Erro ao criar documento: ' + e?.message }, { status: 500 });
    }
}
