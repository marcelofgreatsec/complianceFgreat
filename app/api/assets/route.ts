import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AssetSchema } from '@/lib/validations/asset-schema';
import { validateCSRF } from '@/lib/csrf';
import { log } from '@/lib/audit';
import { logSecurity } from '@/lib/monitor';

export async function GET(req: Request) {
    try {

        const supabase = await createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const assets = await prisma.asset.findMany({
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(assets);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar ativos' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {

        const token = req.headers.get('x-csrf-token');
        if (!token || !(await validateCSRF(token))) {
            logSecurity({ type: 'CSRF_FAILED', severity: 'CRITICAL', details: { ip: req.headers.get('x-forwarded-for') || 'unknown', route: '/api/assets' } });
            return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.user_metadata?.role === 'VIEWER') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        }

        const body = await req.json();

        // Zod validation and sanitization
        const validatedData = AssetSchema.parse(body);
        const { name, type, location, status, ip } = validatedData;

        const assetId = body.id || `AST-${Date.now()}`;

        const asset = await prisma.asset.create({
            data: { id: assetId, name: name!, type: type!, location: location || '', status, ip: ip || null }
        });

        await log({
            action: 'CREATE',
            table: 'ativos',
            recordId: assetId,
            request: req
        });

        return NextResponse.json(asset);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro ao criar ativo' }, { status: 500 });
    }
}
