import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Try a simple query
        const userCount = await prisma.user.count();
        const assetCount = await prisma.asset.count();
        const assets = await prisma.asset.findMany({ take: 1 });

        return NextResponse.json({
            status: 'connected',
            userCount,
            assetCount,
            assets,
            env: {
                has_db_url: !!process.env.DATABASE_URL,
                has_direct_url: !!process.env.DIRECT_URL
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack,
            env: {
                has_db_url: !!process.env.DATABASE_URL,
                has_direct_url: !!process.env.DIRECT_URL
            }
        }, { status: 500 });
    }
}
