import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Fallback in-memory cache if Upstash isn't configured yet
const cache = new Map()

let redisPath: Redis | null = null
try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redisPath = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
    }
} catch (e) {
    console.warn('Upstash Redis not configured, falling back to local Map.')
}

const authLimiter = redisPath ? new Ratelimit({
    redis: redisPath,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
}) : null

const apiLimiter = redisPath ? new Ratelimit({
    redis: redisPath,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
}) : null

export async function rateLimitCheck(ip: string, path: string) {
    if (!redisPath) {
        // Local memory fallback
        const key = `limit:${ip}:${path.startsWith('/api/auth') ? 'auth' : 'api'}`
        const max = path.startsWith('/api/auth') ? 5 : 60
        const now = Date.now()
        const record = cache.get(key) || { count: 0, reset: now + 60000 }

        if (now > record.reset) {
            record.count = 0
            record.reset = now + 60000
        }

        record.count++
        cache.set(key, record)

        return { success: record.count <= max }
    }

    // Upstash Ratelimit
    if (path.startsWith('/api/auth')) {
        return await authLimiter!.limit(ip)
    }
    return await apiLimiter!.limit(ip)
}
