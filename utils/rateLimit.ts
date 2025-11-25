type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

async function rateLimitMemory(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }
  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 }
  }
  bucket.count += 1
  return { allowed: true, remaining: limit - bucket.count }
}

async function rateLimitUpstash(key: string, limit: number, windowMs: number) {
  const base = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!base || !token) return rateLimitMemory(key, limit, windowMs)
  const expires = Math.floor(windowMs / 1000)
  const url = `${base}/pipeline`
  const body = JSON.stringify([
    ["INCR", `ratelimit:${key}`],
    ["EXPIRE", `ratelimit:${key}`, expires],
  ])
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body,
  })
  if (!res.ok) {
    return rateLimitMemory(key, limit, windowMs)
  }
  const data = await res.json()
  const current = Array.isArray(data) && data[0] ? Number(data[0].result) : 0
  if (current > limit) {
    return { allowed: false, remaining: 0 }
  }
  return { allowed: true, remaining: limit - current }
}

export async function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  return rateLimitUpstash(key, limit, windowMs)
}
