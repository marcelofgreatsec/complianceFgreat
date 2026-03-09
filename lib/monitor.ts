import { prisma } from './prisma';

export async function logSecurity(event: {
    type: string
    severity: 'LOW' | 'HIGH' | 'CRITICAL'
    details: any
    ip?: string
}) {
    const payload = {
        timestamp: new Date().toISOString(),
        ...event
    };

    console.warn('[SECURITY]', payload);

    try {
        await prisma.securityAlert.create({
            data: {
                type: event.type,
                severity: event.severity,
                details: typeof event.details === 'object' ? JSON.stringify(event.details) : String(event.details),
                ipAddress: event.ip || 'unknown'
            }
        });
    } catch (e) {
        console.error('Failed to log security alert to DB:', e);
    }
}
