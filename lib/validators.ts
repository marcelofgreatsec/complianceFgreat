import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Helper for DOMPurify sanitization
const sanitize = (value: string | undefined | null) => {
    if (!value) return value;
    return DOMPurify.sanitize(value);
};

export const AssetSchema = z.object({
    name: z.string().min(1).max(255).trim().transform(sanitize),
    type: z.string().min(1).max(100).trim().transform(sanitize),
    ip: z.string().optional().nullable(), // .ip() validation can be strict, we'll just allow string format for now or remove strict ip() constraint
    location: z.string().max(255).optional().transform(sanitize),
    status: z.enum(['Ativo', 'Manutenção', 'Desativado', 'Inativo']).default('Ativo'),
    documents: z.string().optional().nullable().transform(sanitize)
});

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

export const BackupSchema = z.object({
    assetId: z.string().min(1).transform(sanitize),
    backupDate: z.string().datetime(),
    size: z.string().min(1).max(50).transform(sanitize),
    status: z.enum(['Sucesso', 'Erro', 'Pendente']).default('Pendente')
});

export const InfrastructureSchema = z.object({
    id: z.string().optional().nullable().transform(sanitize),
    name: z.string().min(1).max(255).transform(sanitize),
    data: z.string().min(1).transform(sanitize) // JSON strings can be large, sanitize with caution if it contains raw HTML
});

// For Docs, we might need finer control since it can have complex content/markdown.
// Sanitize content carefully if it allows HTML.
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
    credPass: z.string().optional().nullable(), // DO NOT sanitize passwords! It modifies characters.
    responsible: z.string().optional().nullable().transform(sanitize)
});
