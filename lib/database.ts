import { neon } from "@neondatabase/serverless"

let _sql: ReturnType<typeof neon> | null = null

export function getSQL() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  return getSQL()(strings, ...values)
}

// Database types
export interface PaymentConfirmation {
  id: string
  name: string
  email: string
  nim: string
  phone?: string
  weeks: number
  unique_code: number
  total_amount: number
  payment_proof_url?: string
  wa_sent: boolean
  status: "pending" | "verified" | "rejected"
  created_at: string
  updated_at: string
}
