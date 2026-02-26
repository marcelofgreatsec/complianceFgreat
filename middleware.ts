import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Não fazer validações - apenas passar adiante
    return NextResponse.next()
}

export const config = {
    matcher: ['/api/:path*'], // Apenas em APIs
}


