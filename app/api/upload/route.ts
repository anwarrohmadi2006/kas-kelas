import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")
    const formData = await request.formData()
    const file = formData.get("file") as File
    const nim = formData.get("nim") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!nim) {
      return NextResponse.json({ error: "NIM is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak diizinkan. Gunakan JPG, PNG, atau PDF" }, { status: 400 })
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file terlalu besar. Maksimal 5MB" }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()?.toLowerCase()
    const fileName = `payment-proofs/${nim}-${Date.now()}.${fileExt}`

    console.log("[v0] Uploading file to blob:", fileName)

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
    })

    console.log("[v0] File uploaded successfully:", blob.url)

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
