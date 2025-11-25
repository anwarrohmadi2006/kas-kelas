import type { PaymentData } from "../types"

export class PaymentService {
  static async submitPaymentConfirmation(paymentData: PaymentData): Promise<string> {
    const formData = new FormData()

    formData.append("name", paymentData.name)
    formData.append("email", paymentData.email)
    formData.append("nim", paymentData.nim)
    formData.append("phone", paymentData.phone)
    formData.append("weeks", paymentData.weeks.toString())
    formData.append("uniqueCode", paymentData.uniqueCode.toString())
    formData.append("weeklyFee", "10000")
    formData.append("totalAmount", paymentData.totalAmount.toString())
    formData.append("waSent", paymentData.waSent.toString())
    formData.append("paymentProofUrl", paymentData.paymentProofUrl || "")
    formData.append("method", paymentData.method || (paymentData.paymentProofUrl ? "qris" : "cash"))

    const response = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nim: paymentData.nim,
        period_ids: paymentData.periodIds || [],
        total_bayar: paymentData.totalAmount,
        metode: paymentData.method || (paymentData.paymentProofUrl ? "qris" : "tunai"),
        paymentProofUrl: paymentData.paymentProofUrl || null,
        raw_payload: {
          name: paymentData.name,
          email: paymentData.email,
          phone: paymentData.phone,
          weeks: paymentData.weeks,
          uniqueCode: paymentData.uniqueCode,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to submit payment confirmation")
    }

    const result = await response.json()
    return result.data?.id || result.id
  }

  static async getPaymentConfirmation(id: string) {
    const response = await fetch(`/api/payment?id=${id}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to get payment confirmation")
    }

    return response.json()
  }

  static async getAllPaymentConfirmations() {
    const response = await fetch("/api/admin/payments?limit=50")

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to get payment confirmations")
    }

    return response.json()
  }

  static async updatePaymentStatus(id: string, status: "pending" | "verified" | "rejected"): Promise<void> {
    const response = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update payment status")
    }
  }

  static async updatePayment(
    id: string,
    payload: { status?: "pending" | "verified" | "rejected"; method?: "qris" | "tunai" },
  ): Promise<void> {
    const response = await fetch(`/api/admin/payments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...payload }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to update payment")
    }
  }

  static async deletePayment(id: string): Promise<void> {
    const response = await fetch(`/api/admin/payments/${id}`, { method: "DELETE" })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to delete payment")
    }
  }
}
