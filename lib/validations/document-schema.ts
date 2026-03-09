import { z } from 'zod';
import { sanitize } from './sanitize';

export const DocumentSchema = z.object({
    title: z.string().min(1).max(255).transform(sanitize),
    categoryId: z.string().min(1).transform(sanitize),
    type: z.string().min(1).max(100).transform(sanitize),
    description: z.string().optional().nullable().transform(sanitize),
    tags: z.string().optional().nullable().transform(sanitize),
    content: z.string().optional().nullable().transform(sanitize),
    fileUrl: z.string().url().optional().nullable(),
    fileType: z.string().optional().nullable().transform(sanitize),
    credUser: z.string().optional().nullable().transform(sanitize),
    credPass: z.string().optional().nullable(),
    responsible: z.string().optional().nullable().transform(sanitize)
});
