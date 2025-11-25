import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { buildPagination } from "@/utils/pagination"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const { page, limit, offset } = buildPagination(searchParams)
  const status = searchParams.get("status")
  const metode = searchParams.get("metode")
  const dateFrom = searchParams.get("from")
  const dateTo = searchParams.get("to")

  const conditions: string[] = []
  const params: any[] = []

  if (status) {
    params.push(status)
    conditions.push(`p.status = $${params.length}`)
  }
  if (metode) {
    params.push(metode)
    conditions.push(`p.metode = $${params.length}`)
  }
  if (dateFrom) {
    params.push(dateFrom)
    conditions.push(`p.tanggal_bayar >= $${params.length}`)
  }
  if (dateTo) {
    params.push(dateTo)
    conditions.push(`p.tanggal_bayar <= $${params.length}`)
  }

  params.push(limit, offset)
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""

  const dataRes = await query(
    `SELECT p.id, s.nim, s.nama, p.metode, p.status, p.total_bayar, p.tanggal_bayar, p.bukti_url
     FROM payments p
     JOIN students s ON s.id = p.student_id
     ${where}
     ORDER BY p.tanggal_bayar DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  )

  const countRes = await query(
    `SELECT COUNT(*)::int AS count
     FROM payments p
     ${where}`,
    params.slice(0, params.length - 2),
  )

  return NextResponse.json({
    ok: true,
    data: dataRes.rows,
    meta: { page, limit, total: countRes.rows[0].count },
  })
}
