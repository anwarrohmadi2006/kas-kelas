import { NextRequest, NextResponse } from "next/server"

/**
 * Basic CSRF guard: ensure same-origin for mutating requests (POST/PATCH/DELETE)
 * by checking Origin header matches our allowed origin/host.
 */
export function enforceSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return null

  const allowed = process.env.ALLOWED_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL
  if (allowed && origin.startsWith(allowed)) return null

  const host = request.headers.get("host")
  if (host && origin.includes(host)) return null

  return NextResponse.json({ ok: false, error: { code: "FORBIDDEN", message: "Invalid origin" } }, { status: 403 })
}
