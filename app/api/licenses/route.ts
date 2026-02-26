import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { LicenseSchema } from '@/lib/validations/license-schema';
import { validateCSRF } from '@/lib/csrf';
import { log } from '@/lib/audit';
import { logSecurity } from '@/lib/monitor';

/**
 * GET /api/licenses
 * Fetch all licenses.
 */
export async function GET(req: Request) {
    try {

        const supabase = await createClient();
        // const { data: { session } } = await supabase.auth.getSession();

        // if (!session) {
        //     return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        // }


        const licenses = await prisma.license.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(licenses);
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao buscar licenças' }, { status: 500 });
    }
}

/**
 * POST /api/licenses
 * Create a new license.
 */
export async function POST(req: Request) {
    try {

        const token = req.headers.get('x-csrf-token');
        if (!token || !(await validateCSRF(token))) {
            logSecurity({ type: 'CSRF_FAILED', severity: 'CRITICAL', details: { ip: req.headers.get('x-forwarded-for') || 'unknown', route: '/api/licenses' } });
            return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 });
        }

        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
        //     return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        // }


        const body = await req.json();
        const validatedData = LicenseSchema.parse(body);
        const { name, provider, key, totalSeats, usedSeats, monthlyCost, renewalDate, status, responsible, notes } = validatedData;

        const license = await prisma.license.create({
            data: {
                name: name!,
                provider: provider!,
                key: key || null,
                totalSeats,
                usedSeats,
                monthlyCost,
                renewalDate: renewalDate ? new Date(renewalDate) : null,
                status,
                responsible: responsible || null,
                notes: notes || null
            }
        });

        await log({
            action: 'CREATE',
            table: 'licencas',
            recordId: license.id,
            request: req
        });

        return NextResponse.json(license);
    } catch (error: any) {
        console.error('[LICENSE_CREATE_ERROR]', error);
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Dados inválidos', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erro ao criar licença' }, { status: 500 });
    }
}
