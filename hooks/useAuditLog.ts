import { useCallback } from 'react';
import { fetchWithCSRF } from '@/lib/api';

export function useAuditLog() {
    const logAction = useCallback(async (action: string, table: string, recordId?: string) => {
        try {
            await fetchWithCSRF('/api/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action, table, recordId })
            });
        } catch (error) {
            console.error('Failed to register audit log from client:', error);
        }
    }, []);

    return { logAction };
}
