import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { AssetSchema } from '@/lib/validators';

export async function GET() {
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

        // Create initial history record
        await prisma.assetHistory.create({
            data: {
                assetId: assetId,
                action: 'Criação',
                details: 'Ativo cadastrado no sistema',
            }
        });

        // Log the audit
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'CREATE_ASSET',
                resource: assetId,
            }
        });

        return NextResponse.json(asset);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro ao criar ativo' }, { status: 500 });
    }
}
