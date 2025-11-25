import { type NextRequest, NextResponse } from "next/server"
import { getSQL } from "../../../lib/database"

function validateInput(data: any) {
  const errors: string[] = []
  const allowedMethods = ["qris", "cash"]

  if (!data.name || data.name.length < 2 || data.name.length > 100) {
    errors.push("Nama harus antara 2-100 karakter")
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Email tidak valid")
  }

  if (!data.nim || !/^[0-9]+$/.test(data.nim) || data.nim.length < 4) {
    errors.push("Format NIM tidak valid (minimal 4 digit angka)")
  } else {
    const angkatan = Number.parseInt(data.nim.substring(0, 2), 10)
    if (![23, 24, 25].includes(angkatan)) {
      errors.push("NIM harus dari angkatan 23, 24, atau 25")
    }
  }

  if (!data.phone) {
    errors.push("Nomor HP wajib diisi")
  } else {
    const phoneWithout62 = data.phone.startsWith("62") ? data.phone.substring(2) : data.phone
    if (!/^[0-9]{9,13}$/.test(phoneWithout62)) {
      errors.push("Format nomor HP tidak valid (9-13 digit setelah 62)")
    } else if (!phoneWithout62.startsWith("8")) {
      errors.push("Nomor HP harus dimulai dengan 8 setelah kode negara 62")
    }
  }

  const weeksNumber = Number.parseInt(data.weeks?.toString() || "0", 10)
  if (!weeksNumber || isNaN(weeksNumber) || weeksNumber < 1) {
    errors.push("Jumlah pekan harus minimal 1")
  } else if (weeksNumber > 52) {
    errors.push("Jumlah pekan maksimal 52")
  }

  if (data.method && !allowedMethods.includes(data.method)) {
    errors.push("Metode pembayaran tidak valid")
  }

  return errors
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "")
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting payment submission")
    const formData = await request.formData()

    console.log("[v0] FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[v0] ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`)
      } else {
        console.log(`[v0] ${key}: ${value}`)
      }
    }

    const paymentProofUrl = formData.get("paymentProofUrl")?.toString() ?? null

    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      nim: formData.get("nim") as string,
      phone: formData.get("phone") as string,
      weeks: Number(formData.get("weeks")),
      uniqueCode: Number(formData.get("uniqueCode")),
      totalAmount: Number(formData.get("totalAmount")),
      waSent: formData.get("waSent") === "true",
      paymentProofUrl, // Expect URL instead of file
      method: (formData.get("method") as string) || "qris",
    }

    console.log("[v0] Parsed rawData:", rawData)

    const validationErrors = validateInput(rawData)
    if (validationErrors.length > 0) {
      console.log("[v0] Validation errors:", validationErrors)
      return NextResponse.json({ error: "Data tidak valid", details: validationErrors }, { status: 400 })
    }

    console.log("[v0] Validation passed, processing data...")

    const name = sanitizeInput(rawData.name)
    const email = sanitizeInput(rawData.email)
    const nim = sanitizeInput(rawData.nim)
    const phone = rawData.phone ? sanitizeInput(rawData.phone) : ""
    const weeks = rawData.weeks
    const uniqueCode = rawData.uniqueCode
    const totalAmount = rawData.totalAmount
    const waSent = rawData.waSent
    const method = rawData.method || "qris"
    const sanitizedPaymentProofUrl = rawData.paymentProofUrl ? sanitizeInput(rawData.paymentProofUrl) : null

    console.log("[v0] Attempting database insert...")
    const sql = getSQL()

    const result = await sql`
      INSERT INTO payment_confirmations (
        name, email, nim, phone, weeks, unique_code, 
        total_amount, payment_proof_url, wa_sent, status, method
      ) VALUES (
        ${name}, ${email}, ${nim}, 
        ${phone}, ${weeks}, 
        ${uniqueCode}, ${totalAmount}, 
        ${sanitizedPaymentProofUrl}, ${waSent}, 'pending', ${method}
      ) RETURNING id
    `

    console.log("[v0] Database insert successful, ID:", result[0].id)
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("[v0] Payment submission error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Gagal menyimpan konfirmasi pembayaran" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const sql = getSQL()

    if (id) {
      if (!/^[a-zA-Z0-9\-_]{1,50}$/.test(id)) {
        return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
      }

      const result = await sql`
        SELECT * FROM payment_confirmations 
        WHERE id = ${id}
      `

      if (result.length === 0) {
        return NextResponse.json({ error: "Konfirmasi pembayaran tidak ditemukan" }, { status: 404 })
      }

      return NextResponse.json(result[0])
    } else {
      const result = await sql`
        SELECT * FROM payment_confirmations 
        ORDER BY created_at DESC
        LIMIT 1000
      `

      return NextResponse.json(result)
    }
  } catch (error) {
    console.error("Payment fetch error:", error)
    return NextResponse.json({ error: "Gagal mengambil data konfirmasi pembayaran" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, method } = await request.json()

    if (!id || !/^[a-zA-Z0-9\-_]{1,50}$/.test(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const hasStatus = Boolean(status)
    const hasMethod = Boolean(method)

    if (!hasStatus && !hasMethod) {
      return NextResponse.json({ error: "Status atau method wajib diisi" }, { status: 400 })
    }

    if (hasStatus && !["pending", "verified", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
    }

    if (hasMethod && !["qris", "cash"].includes(method)) {
      return NextResponse.json({ error: "Metode tidak valid" }, { status: 400 })
    }

    const sql = getSQL()
    await sql`
      UPDATE payment_confirmations 
      SET 
        status = COALESCE(${status}, status),
        method = COALESCE(${method}, method),
        updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment update error:", error)
    return NextResponse.json({ error: "Gagal memperbarui status pembayaran" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id || !/^[a-zA-Z0-9\-_]{1,50}$/.test(id)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 })
    }

    const sql = getSQL()
    await sql`
      DELETE FROM payment_confirmations
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment delete error:", error)
    return NextResponse.json({ error: "Gagal menghapus pembayaran" }, { status: 500 })
  }
}
