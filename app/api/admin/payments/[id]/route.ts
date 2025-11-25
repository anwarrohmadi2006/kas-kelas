import { NextRequest, NextResponse } from "next/server"
import { withTransaction } from "@/lib/db"
import { enforceSameOrigin } from "@/utils/csrf"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf
  const paymentId = Number(params.id)
  if (!paymentId) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "ID tidak valid" } }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { status, metode, admin_id, catatan_admin } = body || {}

    if (!status && !metode) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Status atau metode wajib" } }, { status: 400 })
    }
    if (status && !["pending", "verified", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Status tidak valid" } }, { status: 400 })
    }
    if (metode && !["qris", "tunai"].includes(metode)) {
      return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "Metode tidak valid" } }, { status: 400 })
    }

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE payments 
         SET status = COALESCE($1, status),
             metode = COALESCE($2, metode),
             verified_by = CASE WHEN $1 = 'verified' THEN $3 ELSE verified_by END,
             catatan_admin = COALESCE($4, catatan_admin),
             updated_at = NOW()
         WHERE id = $5`,
        [status, metode, admin_id || null, catatan_admin || null, paymentId],
      )

      if (status === "verified") {
        const pay = await client.query("SELECT total_bayar, metode FROM payments WHERE id = $1", [paymentId])
        if (pay.rowCount) {
          const total = pay.rows[0].total_bayar
          const sumber = pay.rows[0].metode === "tunai" ? "tunai" : "qris"
          await client.query(
            `INSERT INTO cash_flows (jenis, sumber, amount, keterangan, ref_payment_id)
             VALUES ('in', $1, $2, 'Payment verified', $3)`,
            [sumber, total, paymentId],
          )
        }
      }
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("admin payments patch error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal update" } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf
  const paymentId = Number(params.id)
  if (!paymentId) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "ID tidak valid" } }, { status: 400 })
  }
  try {
    await withTransaction(async (client) => {
      await client.query("DELETE FROM payment_periods WHERE payment_id = $1", [paymentId])
      await client.query("DELETE FROM payments WHERE id = $1", [paymentId])
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("admin payments delete error", err)
    return NextResponse.json({ ok: false, error: { code: "INTERNAL_ERROR", message: "Gagal hapus" } }, { status: 500 })
  }
}
