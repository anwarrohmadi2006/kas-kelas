import { NextRequest, NextResponse } from "next/server"
import { query, withTransaction } from "@/lib/db"
import { rateLimit } from "@/utils/rateLimit"
import { enforceSameOrigin } from "@/utils/csrf"

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anon"
  const rl = await rateLimit(`payments:${ip}`, 20, 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: { code: "RATE_LIMIT", message: "Too many requests" } }, { status: 429 })
  }
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf

  try {
    const payload = await request.json()
    const { nim, period_ids, total_bayar, metode, paymentProofUrl, idempotency_key, raw_payload } = payload || {}

    if (!nim || !Array.isArray(period_ids) || period_ids.length === 0 || !total_bayar || !metode) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "nim, period_ids, total_bayar, metode wajib" } },
        { status: 400 },
      )
    }
    if (!["qris", "tunai"].includes(metode)) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "metode tidak valid" } }, { status: 400 })
    }

    const studentRes = await query("SELECT id FROM students WHERE nim = $1", [nim])
    if (studentRes.rowCount === 0) {
      return NextResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "NIM tidak ditemukan" } }, { status: 404 })
    }
    const studentId = studentRes.rows[0].id

    const periodsRes = await query("SELECT id, nominal FROM periods WHERE id = ANY($1)", [period_ids])
    if (periodsRes.rowCount !== period_ids.length) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Period tidak valid" } }, { status: 400 })
    }
    const sumNominal = periodsRes.rows.reduce((acc: number, p: any) => acc + p.nominal, 0)
    if (sumNominal !== total_bayar) {
      return NextResponse.json(
        { ok: false, error: { code: "VALIDATION_ERROR", message: "total_bayar tidak sesuai nominal periode" } },
        { status: 400 },
      )
    }

    const result = await withTransaction(async (client) => {
      const insertPayment = await client.query(
        `INSERT INTO payments (student_id, metode, total_bayar, bukti_url, status, raw_payload, idempotency_key)
         VALUES ($1, $2, $3, $4, 'pending', $5, $6)
         ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = NOW()
         RETURNING id`,
        [studentId, metode, total_bayar, paymentProofUrl || null, raw_payload || {}, idempotency_key || null],
      )
      const paymentId = insertPayment.rows[0].id

      for (const p of periodsRes.rows) {
        await client.query(
          `INSERT INTO payment_periods (payment_id, period_id, nominal)
           VALUES ($1, $2, $3)
           ON CONFLICT (payment_id, period_id) DO NOTHING`,
          [paymentId, p.id, p.nominal],
        )
      }

      return paymentId
    })

    return NextResponse.json({ ok: true, data: { id: result } })
  } catch (err) {
    console.error("payments POST error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal membuat pembayaran" } }, { status: 500 })
  }
}
