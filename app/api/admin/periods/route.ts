import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildPagination } from "@/utils/pagination"
import { enforceSameOrigin } from "@/utils/csrf"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { page, limit, offset } = buildPagination(searchParams)
  const active = searchParams.get("active")

  const conditions: string[] = []
  const params: any[] = []
  if (active) {
    params.push(active === "true")
    conditions.push(`is_active = $${params.length}`)
  }
  params.push(limit, offset)
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

  const rows = await query(
    `SELECT id, kode_periode, nama_periode, nominal, tanggal_mulai, tanggal_selesai, is_active
     FROM periods
     ${where}
     ORDER BY tanggal_mulai DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )
  const count = await query(`SELECT COUNT(*)::int AS count FROM periods ${where}`, params.slice(0, params.length - 2))

  return NextResponse.json({ ok: true, data: rows.rows, meta: { page, limit, total: count.rows[0].count } })
}

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf
  const body = await request.json()
  const { kode_periode, nama_periode, nominal, tanggal_mulai, tanggal_selesai, is_active = true } = body || {}
  if (!kode_periode || !nama_periode || !nominal || !tanggal_mulai || !tanggal_selesai) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "Field wajib belum lengkap" } },
      { status: 400 },
    )
  }

  try {
    const res = await query(
      `INSERT INTO periods (kode_periode, nama_periode, nominal, tanggal_mulai, tanggal_selesai, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [kode_periode, nama_periode, nominal, tanggal_mulai, tanggal_selesai, is_active],
    )
    return NextResponse.json({ ok: true, data: { id: res.rows[0].id } })
  } catch (err) {
    console.error("create period error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal membuat periode" } }, { status: 500 })
  }
}
