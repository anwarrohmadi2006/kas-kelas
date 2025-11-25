import { NextRequest, NextResponse } from "next/server"
import { sendFonnte } from "@/services/fonnte"
import { enforceSameOrigin } from "@/utils/csrf"

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf
  const body = await request.json()
  const { targets, message } = body || {}

  if (!Array.isArray(targets) || targets.length === 0 || !message) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "targets array dan message wajib" } },
      { status: 400 },
    )
  }

  try {
    // simple rate limit: chunk 20, delay 60s between chunks
    const chunkSize = 20
    for (let i = 0; i < targets.length; i += chunkSize) {
      const slice = targets.slice(i, i + chunkSize)
      await Promise.all(slice.map((t: string) => sendFonnte({ target: t, message })))
      if (i + chunkSize < targets.length) {
        await new Promise((r) => setTimeout(r, 60_000))
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("reminder send error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal mengirim" } }, { status: 500 })
  }
}
