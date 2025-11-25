import { sql } from "../lib/database"
import { put } from "@vercel/blob"
import type { PaymentData } from "../types"
import type { PaymentConfirmation } from "../lib/database"

export class PaymentService {
  static async uploadPaymentProof(file: File, nim: string): Promise<string> {
    const fileExt = file.name.split(".").pop()
    const fileName = `payment-proofs/${nim}-${Date.now()}.${fileExt}`

    try {
      const blob = await put(fileName, file, {
        access: "public",
      })

      return blob.url
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async submitPaymentConfirmation(paymentData: PaymentData & { paymentProofUrl?: string }): Promise<string> {
    const paymentProofUrl = paymentData.paymentProofUrl || ""

    // Convert phone to numeric format for database storage
    const phoneNumeric = paymentData.phone?.replace(/\D/g, "") || ""

    try {
      const formData = new FormData()
      formData.append("name", paymentData.name)
      formData.append("email", paymentData.email)
      formData.append("nim", paymentData.nim)
      formData.append("phone", phoneNumeric)
      formData.append("weeks", paymentData.weeks.toString())
      formData.append("uniqueCode", paymentData.uniqueCode.toString())
      formData.append("totalAmount", paymentData.totalAmount.toString())
      formData.append("waSent", (paymentData.waSent || false).toString())
      formData.append("paymentProofUrl", paymentProofUrl)

      const response = await fetch("/api/payment", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit payment")
      }

      return result.id
    } catch (error) {
      throw new Error(
        `Failed to submit payment confirmation: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  static async getPaymentConfirmation(id: string): Promise<PaymentConfirmation> {
    try {
      const result = await sql`
        SELECT * FROM payment_confirmations 
        WHERE id = ${id}
      `

      if (result.length === 0) {
        throw new Error("Payment confirmation not found")
      }

      return result[0] as PaymentConfirmation
    } catch (error) {
      throw new Error(`Failed to get payment confirmation: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  static async getAllPaymentConfirmations(): Promise<PaymentConfirmation[]> {
    try {
      const result = await sql`
        SELECT * FROM payment_confirmations 
        ORDER BY created_at DESC
      `

      return result as PaymentConfirmation[]
    } catch (error) {
      throw new Error(
        `Failed to get payment confirmations: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  static async updatePaymentStatus(id: string, status: "pending" | "verified" | "rejected"): Promise<void> {
    try {
      await sql`
        UPDATE payment_confirmations 
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${id}
      `
    } catch (error) {
      throw new Error(`Failed to update payment status: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}
