import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createSessionToken } from "../../../../lib/adminSession"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Email dan password wajib" } }, { status: 400 })
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
      return NextResponse.json(
        { ok: false, error: { code: "CONFIG_ERROR", message: "ADMIN_EMAIL / ADMIN_PASSWORD_HASH belum diset" } },
        { status: 500 },
      )
    }

    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Kredensial salah" } }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
    if (!isValid) {
      return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Kredensial salah" } }, { status: 401 })
    }

    const session = createSessionToken(email)
    const response = NextResponse.json({ ok: true, data: { email } })
    response.cookies.set("admin_session", session, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return response
  } catch (error) {
    console.error("Admin login error", error)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal login admin" } }, { status: 500 })
  }
}
