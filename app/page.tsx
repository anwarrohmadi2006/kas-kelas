"use client"

import { useState } from "react"
import PaymentForm from "../components/PaymentForm"
import QRISPayment from "../components/QRISPayment"
import WhatsAppConfirmation from "../components/WhatsAppConfirmation"
import ConfirmationPage from "../components/ConfirmationPage"
import type { PaymentData } from "../types"

export default function Page() {
  const [paymentData, setPaymentData] = useState<(PaymentData & { id: string; paymentProofUrl?: string }) | null>(null)
  const [currentStep, setCurrentStep] = useState<"form" | "qris" | "whatsapp" | "confirmation">("form")

  const handleFormSubmit = (data: PaymentData) => {
    setPaymentData({ ...data, id: "" }) // ID will be set after WhatsApp confirmation
    setCurrentStep("qris")
  }

  const handleQRISNext = (paymentProofUrl?: string) => {
    if (paymentData && paymentProofUrl) {
      setPaymentData({ ...paymentData, paymentProofUrl })
    }
    setCurrentStep("whatsapp")
  }

  const handleWhatsAppConfirmed = async (data: PaymentData & { id: string }) => {
    setPaymentData(data)
    setCurrentStep("confirmation")

    // Log successful submission
    console.log("Payment data successfully submitted to database:", {
      id: data.id,
      name: data.name,
      nim: data.nim,
      totalAmount: data.totalAmount,
    })
  }

  const handleBackToForm = () => {
    setCurrentStep("form")
    setPaymentData(null)
  }

  const handleBackToQRIS = () => {
    setCurrentStep("qris")
  }

  const handleBackToWhatsApp = () => {
    setCurrentStep("whatsapp")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8 px-4">
      <div className="container mx-auto">
        {currentStep === "confirmation" && paymentData ? (
          <ConfirmationPage data={paymentData} onBack={handleBackToWhatsApp} />
        ) : currentStep === "whatsapp" && paymentData ? (
          <WhatsAppConfirmation data={paymentData} onBack={handleBackToQRIS} onConfirmed={handleWhatsAppConfirmed} />
        ) : currentStep === "qris" && paymentData ? (
          <QRISPayment
            paymentData={{
              nama: paymentData.name,
              nim: paymentData.nim,
              weeks: Number.parseInt(paymentData.weeks) || 1,
              uniqueCode: paymentData.uniqueCode || 0,
              total: paymentData.totalAmount || 0,
            }}
            onBack={handleBackToForm}
            onNext={handleQRISNext}
          />
        ) : (
          <PaymentForm onSubmit={handleFormSubmit} />
        )}
      </div>
    </div>
  )
}
