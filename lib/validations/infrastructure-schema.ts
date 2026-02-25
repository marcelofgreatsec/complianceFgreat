import { z } from 'zod';
import { sanitize } from './sanitize';

export const InfrastructureSchema = z.object({
    id: z.string().optional().nullable().transform(sanitize),
    name: z.string().min(1).max(255).transform(sanitize),
    data: z.string().min(1).transform(sanitize)
});
