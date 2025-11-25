import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildPagination } from "@/utils/pagination"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { page, limit, offset } = buildPagination(searchParams)
  const status = searchParams.get("status")
  const q = searchParams.get("q")

  const conditions: string[] = []
  const params: any[] = []

  if (status) {
    params.push(status)
    conditions.push(`status = $${params.length}`)
  }
  if (q) {
    params.push(`%${q}%`)
    conditions.push(`(nim ILIKE $${params.length} OR nama ILIKE $${params.length})`)
  }

  params.push(limit, offset)
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

  const res = await query(
    `SELECT id, nim, nama, status, kelas, angkatan, email, whatsapp
     FROM students
     ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )
  const count = await query(`SELECT COUNT(*)::int AS count FROM students ${where}`, params.slice(0, params.length - 2))

  return NextResponse.json({ ok: true, data: res.rows, meta: { page, limit, total: count.rows[0].count } })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { nim, nama, status = "active", kelas, angkatan, email, whatsapp } = body || {}
  if (!nim || !nama) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "nim dan nama wajib" } }, { status: 400 })
  }
  try {
    const res = await query(
      `INSERT INTO students (nim, nama, status, kelas, angkatan, email, whatsapp)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (nim) DO NOTHING
       RETURNING id`,
      [nim, nama, status, kelas || null, angkatan || null, email || null, whatsapp || null],
    )
    if (res.rowCount === 0) {
      return NextResponse.json({ ok: false, error: { code: "CONFLICT", message: "NIM sudah ada" } }, { status: 409 })
    }
    return NextResponse.json({ ok: true, data: { id: res.rows[0].id } })
  } catch (err) {
    console.error("create student error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal membuat student" } }, { status: 500 })
  }
}
