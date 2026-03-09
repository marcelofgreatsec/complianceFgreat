import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

export async function generateCSRF(): Promise<string> {
    const token = randomBytes(32).toString('hex')
    const cookieStore = await cookies()
    cookieStore.set('csrf', token, { httpOnly: true, sameSite: 'strict' })
    return token
}

export async function validateCSRF(token: string): Promise<boolean> {
    const cookieStore = await cookies()
    const stored = cookieStore.get('csrf')?.value
    return stored === token
}
