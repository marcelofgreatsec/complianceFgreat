const limiterMap = new Map()

export async function rateLimit(id: string, max = 60) {
    const now = Date.now()
    const key = `limit:${id}`
    const record = limiterMap.get(key) || { count: 0, reset: now + 60000 }

    if (now > record.reset) {
        record.count = 0
        record.reset = now + 60000
    }

    record.count++
    limiterMap.set(key, record)

    return {
        success: record.count <= max,
        remaining: Math.max(0, max - record.count)
    }
}
