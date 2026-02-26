import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Não fazer validações - apenas passar adiante
    return NextResponse.next()
}

// Aplicar apenas em rotas específicas se necessário
export const config = {
    matcher: ['/api/:path*'], // Apenas em APIs, não em tudo
}
