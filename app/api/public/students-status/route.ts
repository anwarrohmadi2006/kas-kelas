import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  const res = await query(
    `SELECT status, COUNT(*)::int AS count
     FROM bills
     GROUP BY status`,
  )
  const data: Record<string, number> = {}
  res.rows.forEach((r: any) => {
    data[r.status] = r.count
  })
  return NextResponse.json({ ok: true, data })
}
