import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimitCheck } from '@/lib/rate-limit'
import { logSecurity } from '@/lib/monitor'

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api')) {
        const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
        const { success } = await rateLimitCheck(ip, request.nextUrl.pathname)
        if (!success) {
            logSecurity({ type: 'RATE_LIMIT_EXCEEDED', severity: 'HIGH', details: { ip, route: request.nextUrl.pathname } })
            return new NextResponse("Too Many Requests", { status: 429 })
        }
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        const secureOptions = {
                            ...options,
                            secure: true,      // HTTPS enforced
                            httpOnly: true,    // JS can't read the cookie
                            maxAge: 3600       // Hard limit 1 hour
                        };
                        supabaseResponse.cookies.set(name, value, secureOptions);
                    })
                },
            },
        }
    )

    const {
        data: { session },
    } = await supabase.auth.getSession()

    const publicPaths = ['/login', '/_next', '/api/auth', '/favicon.ico']
    const isPublic = publicPaths.some(p => request.nextUrl.pathname.startsWith(p))

    if (!session && !isPublic) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (session && request.nextUrl.pathname === '/login') {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    // Apply strict CSP to all responses passing through middleware
    supabaseResponse.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:;"
    )

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public|images).*)'],
}
