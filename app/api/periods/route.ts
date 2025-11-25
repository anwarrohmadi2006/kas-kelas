import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET() {
  const res = await query(
    `SELECT id, kode_periode, nama_periode, nominal, tanggal_mulai, tanggal_selesai 
     FROM periods 
     WHERE is_active = TRUE
     ORDER BY tanggal_mulai ASC`,
  )

  return NextResponse.json({
    ok: true,
    data: res.rows.map((p: any) => ({
      id: p.id,
      kode: p.kode_periode,
      nama: p.nama_periode,
      nominal: p.nominal,
      start: p.tanggal_mulai,
      end: p.tanggal_selesai,
    })),
  })
}
