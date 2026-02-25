export function logSecurity(event: {
    type: string
    severity: 'LOW' | 'HIGH' | 'CRITICAL'
    details: any
}) {
    console.warn('[SECURITY]', {
        timestamp: new Date().toISOString(),
        ...event
    })
}
