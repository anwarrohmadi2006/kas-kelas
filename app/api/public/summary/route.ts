import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  const totalsRes = await query(
    `SELECT 
      COALESCE(SUM(CASE WHEN status='verified' THEN total_bayar END),0) AS kas_masuk
     FROM payments`,
  )
  const kasMasuk = Number(totalsRes.rows[0].kas_masuk || 0)

  const studentsRes = await query(`SELECT COUNT(*) FILTER (WHERE status='active') AS active_count FROM students`)
  const activeCount = Number(studentsRes.rows[0].active_count || 0)

  return NextResponse.json({
    ok: true,
    data: {
      total_kas_masuk: kasMasuk,
      total_kas_keluar: 0,
      saldo: kasMasuk,
      total_students: activeCount,
    },
  })
}
