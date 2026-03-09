import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Environment variable safety check
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('[MIDDLEWARE] Missing Supabase environment variables');
        return supabaseResponse;
    }

    // Refresh session with a timeout to prevent hanging the request
    // do not remove this logic as it updates the cookies
    let user = null;
    try {
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 8000)
        );
        const { data } = await Promise.race([userPromise, timeoutPromise]) as any;
        user = data?.user;

        // Sync user to Prisma if they exist and we are not in build mode
        if (user && Object.keys(prisma).length > 0) {
            try {
                // We use the Supabase ID as the Prisma ID
                await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        email: user.email,
                        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                        role: user.user_metadata?.role || 'VIEWER'
                    },
                    create: {
                        id: user.id,
                        email: user.email!,
                        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                        role: user.user_metadata?.role || 'VIEWER'
                    }
                });
            } catch (syncError) {
                console.error('[MIDDLEWARE_SYNC_ERROR]', syncError);
            }
        }
    } catch (e) {
        console.error('[MIDDLEWARE_USER_FETCH_ERROR]', e);
        // On error or timeout, we proceed without a user to avoid 504s
    }

    const isProtected = !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth');

    if (!user && isProtected) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
