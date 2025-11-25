import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { enforceSameOrigin } from "@/utils/csrf"

export async function GET() {
  const res = await query(`SELECT key, value FROM app_settings`)
  const data: Record<string, any> = {}
  res.rows.forEach((r: any) => {
    data[r.key] = r.value
  })
  // derived: fonnte token presence (from env only)
  data.fonnte_configured = Boolean(process.env.FONNTE_API_TOKEN)
  return NextResponse.json({ ok: true, data })
}

export async function PATCH(request: NextRequest) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf
  const body = await request.json()
  const entries = Object.entries(body || {})
  if (entries.length === 0) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "payload kosong" } }, { status: 400 })
  }

  try {
    for (const [key, value] of entries) {
      await query(
        `INSERT INTO app_settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, value],
      )
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("settings update error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal simpan settings" } }, { status: 500 })
  }
}
