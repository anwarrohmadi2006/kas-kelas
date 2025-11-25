import type { FormErrors } from "../types"

export function validateForm(data: {
  name: string
  email: string
  nim: string
  phone: string
  weeks: number
  paymentProof: File | null
}): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = "Nama lengkap wajib diisi"
  }

  if (!data.email.trim()) {
    errors.email = "Email wajib diisi"
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Format email tidak valid"
  }

  if (!data.nim.trim()) {
    errors.nim = "NIM wajib diisi"
  } else if (!/^[0-9]+$/.test(data.nim) || data.nim.length < 4) {
    errors.nim = "Format NIM tidak valid (minimal 4 digit angka)"
  } else {
    const angkatan = Number.parseInt(data.nim.substring(0, 2), 10)
    if (![23, 24, 25].includes(angkatan)) {
      errors.nim = "NIM harus dari angkatan 23, 24, atau 25"
    }
  }

  if (!data.phone.trim()) {
    errors.phone = "Nomor HP wajib diisi"
  } else {
    // Remove 62 prefix for validation
    const phoneWithout62 = data.phone.startsWith("62") ? data.phone.substring(2) : data.phone
    if (!/^[0-9]{9,13}$/.test(phoneWithout62)) {
      errors.phone = "Format nomor HP tidak valid (9-13 digit setelah 62)"
    } else if (!phoneWithout62.startsWith("8")) {
      errors.phone = "Nomor HP harus dimulai dengan 8 setelah kode negara 62"
    }
  }

  const weeksNumber = Number.parseInt(data.weeks?.toString() || "0", 10)
  if (!weeksNumber || isNaN(weeksNumber) || weeksNumber < 1) {
    errors.weeks = "Jumlah pekan harus minimal 1"
  } else if (weeksNumber > 52) {
    errors.weeks = "Jumlah pekan maksimal 52"
  }

  // Payment proof is no longer required in step 1, it will be uploaded in step 2

  return errors
}

export function validatePaymentProof(file: File | null): string | null {
  if (!file) {
    return null // No error if no file provided
  }

  const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
  if (!validTypes.includes(file.type)) {
    return "Format file harus JPG, PNG, atau PDF"
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Ukuran file maksimal 5MB"
  }

  return null
}
