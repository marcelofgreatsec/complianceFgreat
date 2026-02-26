import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Deixar passar TODOS os requests sem fazer validações
    // Apenas registrar o middleware como ativo (não causa timeout)
    return NextResponse.next()
}

export const config = {
    matcher: [
        // Middleware para páginas e rotas SSR
        // Remover /api para não interceptar APIs
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
