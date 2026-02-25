import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { InfrastructureSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { validateCSRF } from '@/lib/csrf';
import { logSecurity } from '@/lib/monitor';
import { log } from '@/lib/audit';

export async function GET(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const { success } = await rateLimit(ip);

        if (!success) {
            logSecurity({ type: 'RATE_LIMIT', severity: 'HIGH', details: { ip, route: '/api/infra' } });
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

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
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const { success } = await rateLimit(ip);

        if (!success) {
            logSecurity({ type: 'RATE_LIMIT', severity: 'HIGH', details: { ip, route: '/api/infra' } });
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const token = req.headers.get('x-csrf-token');
        if (!token || !(await validateCSRF(token))) {
            logSecurity({ type: 'CSRF_FAILED', severity: 'CRITICAL', details: { ip, route: '/api/infra' } });
            return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 });
        }

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

        await log({
            action: id ? 'UPDATE' : 'CREATE',
            table: 'infrastructure',
            recordId: diagram.id,
            request: req
        });

        return NextResponse.json(diagram);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro ao salvar diagrama' }, { status: 500 });
    }
}
