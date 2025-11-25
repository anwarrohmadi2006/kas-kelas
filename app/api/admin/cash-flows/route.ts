import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildPagination } from "@/utils/pagination"
import { enforceSameOrigin } from "@/utils/csrf"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { page, limit, offset } = buildPagination(searchParams)
  const jenis = searchParams.get("jenis")

  const conditions: string[] = []
  const params: any[] = []

  if (jenis) {
    params.push(jenis)
    conditions.push(`jenis = $${params.length}`)
  }

  params.push(limit, offset)
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

  const res = await query(
    `SELECT id, jenis, sumber, tanggal, amount, keterangan
     FROM cash_flows
     ${where}
     ORDER BY tanggal DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )
  const count = await query(`SELECT COUNT(*)::int AS count FROM cash_flows ${where}`, params.slice(0, params.length - 2))

  return NextResponse.json({ ok: true, data: res.rows, meta: { page, limit, total: count.rows[0].count } })
}

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf
  const body = await request.json()
  const { jenis, sumber, amount, keterangan } = body || {}
  if (!jenis || !["in", "out"].includes(jenis) || !sumber || !amount) {
    return NextResponse.json(
      { ok: false, error: { code: "VALIDATION_ERROR", message: "jenis (in/out), sumber, amount wajib" } },
      { status: 400 },
    )
  }
  try {
    const res = await query(
      `INSERT INTO cash_flows (jenis, sumber, amount, keterangan)
       VALUES ($1,$2,$3,$4)
       RETURNING id`,
      [jenis, sumber, amount, keterangan || null],
    )
    return NextResponse.json({ ok: true, data: { id: res.rows[0].id } })
  } catch (err) {
    console.error("create cash-flow error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal membuat cash flow" } }, { status: 500 })
  }
}
