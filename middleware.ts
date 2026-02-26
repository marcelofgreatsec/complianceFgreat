// Deprecated middleware to prevent Vercel ERR_CONNECTION_TIMED_OUT
// This simplified version avoids hanging on edge functions when environment variables are missing.
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Não fazer validações - apenas passar adiante
    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*'], // Apenas em APIs
}


