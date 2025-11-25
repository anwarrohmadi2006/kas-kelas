import { createHmac, randomBytes } from "crypto"

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "dev-admin-session-secret"

function sign(payload: string) {
  return createHmac("sha256", SESSION_SECRET).update(payload).digest("hex")
}

export function createSessionToken(email: string) {
  const nonce = randomBytes(8).toString("hex")
  const issuedAt = Date.now()
  const payload = `${email}|${issuedAt}|${nonce}`
  const signature = sign(payload)
  return Buffer.from(`${payload}|${signature}`).toString("base64url")
}

export function verifySessionToken(token: string): { email: string; issuedAt: number } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8")
    const [email, issuedAtStr, nonce, signature] = decoded.split("|")
    if (!email || !issuedAtStr || !nonce || !signature) return null
    const expected = sign(`${email}|${issuedAtStr}|${nonce}`)
    if (expected !== signature) return null
    const issuedAt = Number(issuedAtStr)
    if (Number.isNaN(issuedAt)) return null
    return { email, issuedAt }
  } catch (error) {
    return null
  }
}
