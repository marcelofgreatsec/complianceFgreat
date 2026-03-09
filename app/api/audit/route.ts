import { NextResponse } from 'next/server';
import { log } from '@/lib/audit';
import { validateCSRF } from '@/lib/csrf';
import { logSecurity } from '@/lib/monitor';

export async function POST(req: Request) {
    try {

        const token = req.headers.get('x-csrf-token');
        if (!token || !(await validateCSRF(token))) {
            logSecurity({ type: 'CSRF_FAILED', severity: 'CRITICAL', details: { ip: req.headers.get('x-forwarded-for') || 'unknown', route: '/api/audit' } });
            return NextResponse.json({ error: 'Invalid CSRF' }, { status: 403 });
        }

        const body = await req.json();
        const { action, table, recordId } = body;

        await log({
            action: action || 'UNKNOWN',
            table: table || 'unknown_table',
            recordId: recordId,
            request: req
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erro ao logar' }, { status: 500 });
    }
}
