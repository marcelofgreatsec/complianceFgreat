import { z } from 'zod';
import { sanitize } from './sanitize';

export const AssetSchema = z.object({
    name: z.string().min(1).max(255).trim().transform(sanitize),
    type: z.string().min(1).max(100).trim().transform(sanitize),
    ip: z.string().optional().nullable(),
    location: z.string().max(255).optional().transform(sanitize),
    status: z.enum(['Ativo', 'Manutenção', 'Desativado', 'Inativo']).default('Ativo'),
    documents: z.string().optional().nullable().transform(sanitize)
});
