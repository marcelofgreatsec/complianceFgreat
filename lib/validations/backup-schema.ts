import { z } from 'zod';
import { sanitize } from './sanitize';

export const BackupSchema = z.object({
    assetId: z.string().min(1).transform(sanitize),
    backupDate: z.string().datetime(),
    size: z.string().min(1).max(50).transform(sanitize),
    status: z.enum(['Sucesso', 'Erro', 'Pendente']).default('Pendente')
});
