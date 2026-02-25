import { z } from 'zod';
import { sanitize } from './sanitize';

export const LicenseSchema = z.object({
    name: z.string().min(1).max(255).trim().transform(sanitize),
    provider: z.string().min(1).max(255).trim().transform(sanitize),
    key: z.string().optional().nullable().transform(sanitize),
    totalSeats: z.coerce.number().int().min(1).optional().default(1),
    usedSeats: z.coerce.number().int().min(0).optional().default(0),
    monthlyCost: z.coerce.number().min(0).optional().default(0.0),
    renewalDate: z.string().datetime().optional().nullable(),
    status: z.enum(['Ativo', 'Inativo', 'Expirada']).default('Ativo'),
    responsible: z.string().optional().nullable().transform(sanitize),
    notes: z.string().optional().nullable().transform(sanitize)
});
