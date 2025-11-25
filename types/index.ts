export interface PaymentData {
  name: string
  email: string
  nim: string
  phone: string
  weeks: number
  angkatan: number
  uniqueCode: number
  weeklyFee: number
  totalAmount: number
  paymentProof: File | null
  paymentProofUrl?: string
  waSent: boolean
  method?: "qris" | "tunai"
  timestamp: string
  periodIds?: number[]
}

export interface WeekConfig {
  weeklyFee: number
  label: string
  description: string
}

export interface RoleConfig {
  baseFee: number
  label: string
  description: string
}

export interface FormErrors {
  name?: string
  email?: string
  nim?: string
  phone?: string
  weeks?: string
  paymentProof?: string
  waSent?: string
}
