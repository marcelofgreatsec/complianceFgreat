import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';
import { LicenseSchema } from '@/lib/validations/license-schema';

/**
 * PATCH /api/licenses/[id]
 * Update a specific license.
 */
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
        //     return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        // }
        const user = { id: 'temp-build-id' };


        const { id } = await context.params;
        const body = await req.json();
        const validatedData = LicenseSchema.partial().parse(body);

        const license = await prisma.license.update({
            where: { id },
            data: validatedData as any
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'UPDATE',
                tableName: 'licencas',
                resource: `LICENSE:${id} (${license.name})`,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
            }
        });

        return NextResponse.json(license);
    } catch (error: any) {
        console.error('[LICENSES_PATCH_ERROR]', error.message || error);
        return NextResponse.json({ error: 'Erro ao atualizar licença', details: error.message }, { status: 500 });
    }
}

/**
 * DELETE /api/licenses/[id]
 * Delete a specific license.
 */
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createClient();
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user || !['ADMIN', 'TI'].includes(user.user_metadata?.role)) {
        //     return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
        // }
        const user = { id: 'temp-build-id' };


        const { id } = await context.params;

        const license = await prisma.license.findUnique({ where: { id } });

        await prisma.license.delete({
            where: { id }
        });

        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'DELETE',
                tableName: 'licencas',
                resource: `LICENSE:${id} (${license?.name || 'Unknown'})`,
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown'
            }
        });

        return NextResponse.json({ message: 'Licença excluída com sucesso' });
    } catch (error: any) {
        console.error('[LICENSES_DELETE_ERROR]', error.message || error);
        return NextResponse.json({ error: 'Erro ao excluir licença', details: error.message }, { status: 500 });
    }
}
