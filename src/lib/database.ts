import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

export const sql = neon(process.env.DATABASE_URL)

// Database types
export interface PaymentConfirmation {
  id: string
  name: string
  email: string
  nim: string
  phone?: string
  role: "mahasiswa_baru" | "panitia" | "volunteer"
  angkatan: number
  unique_code: number
  base_fee: number
  total_amount: number
  payment_proof_url?: string
  wa_sent: boolean
  status: "pending" | "verified" | "rejected"
  created_at: string
  updated_at: string
}
