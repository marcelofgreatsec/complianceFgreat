import { generateCSRF } from '@/lib/csrf'
import { NextResponse } from 'next/server'

export async function GET() {
    const token = await generateCSRF()
    return NextResponse.json({ csrfToken: token })
}
