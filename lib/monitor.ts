import { supabaseAdmin } from './supabase-admin';

export async function logSecurity(event: {
    type: string
    severity: 'LOW' | 'HIGH' | 'CRITICAL'
    details: any
}) {
    const payload = {
        timestamp: new Date().toISOString(),
        ...event
    };

    console.warn('[SECURITY]', payload);

    try {
        await supabaseAdmin.from('security_alerts').insert({
            type: event.type,
            severity: event.severity,
            details: event.details
        });
    } catch (e) {
        console.error('Failed to log security alert to DB:', e);
    }
}
