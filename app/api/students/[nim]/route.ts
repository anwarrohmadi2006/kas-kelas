import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { rateLimit } from "@/utils/rateLimit"

export async function GET(request: NextRequest, { params }: { params: { nim: string } }) {
  const ip = request.headers.get("x-forwarded-for") || "anon"
  const rl = await rateLimit(`students:${ip}`, 30, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: { code: "RATE_LIMIT", message: "Too many requests" } }, { status: 429 })
  }

  const nim = params.nim
  if (!nim) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "NIM required" } }, { status: 400 })
  }

  const studentRes = await query("SELECT id, nim, nama, status FROM students WHERE nim = $1 AND status = 'active' LIMIT 1", [nim])
  if (studentRes.rowCount === 0) {
    return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "NIM tidak ditemukan" } }, { status: 404 })
  }
  const student = studentRes.rows[0]

  const billsRes = await query(
    `SELECT b.status, b.nominal, b.period_id, p.kode_periode, p.nama_periode
     FROM bills b
     JOIN periods p ON b.period_id = p.id
     WHERE b.student_id = $1`,
    [student.id],
  )
  const paymentsRes = await query(
    `SELECT id, metode, status, total_bayar, tanggal_bayar 
     FROM payments 
     WHERE student_id = $1`,
    [student.id],
  )

  const totalNominal = billsRes.rows.reduce((acc, b: any) => acc + b.nominal, 0)
  const paidNominal = paymentsRes.rows
    .filter((p: any) => p.status === "verified")
    .reduce((acc, p: any) => acc + p.total_bayar, 0)

  return NextResponse.json({
    ok: true,
    data: {
      student: {
        id: student.id,
        nimMasked: student.nim.slice(0, 4) + "****" + student.nim.slice(-2),
        namaSingkat: student.nama.split(" ").slice(0, 2).join(" "),
      },
      summary: {
        total_tagihan: totalNominal,
        total_terbayar: paidNominal,
        sisa: Math.max(0, totalNominal - paidNominal),
      },
      bills: billsRes.rows.map((b: any) => ({
        period_id: b.period_id,
        kode: b.kode_periode,
        nama: b.nama_periode,
        status: b.status,
        nominal: b.nominal,
      })),
    },
  })
}
