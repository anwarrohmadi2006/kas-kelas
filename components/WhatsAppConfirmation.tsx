"use client"

import { useState } from "react"
import { MessageCircle, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import type { PaymentData } from "../types"
import { PaymentService } from "../services/paymentService"
import { EVENT_CONFIG } from "../config/constants"
import { generateWhatsAppMessage, formatCurrency } from "../utils/calculations"

interface WhatsAppConfirmationProps {
  data: PaymentData
  onBack: () => void
  onConfirmed: (data: PaymentData & { id: string }) => void
}

export default function WhatsAppConfirmation({ data, onBack, onConfirmed }: WhatsAppConfirmationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [whatsappSent, setWhatsappSent] = useState(false)

  const whatsappMessage = generateWhatsAppMessage({
    name: data.name,
    weeks: data.weeks,
    nim: data.nim,
    uniqueCode: data.uniqueCode,
    totalAmount: data.totalAmount,
    eventName: EVENT_CONFIG.name,
  })

  const whatsappUrl = `https://wa.me/${EVENT_CONFIG.adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`

  const handleConfirmSubmission = async () => {
    if (!whatsappSent) {
      setError("Silakan konfirmasi bahwa Anda sudah mengirim pesan WhatsApp ke admin")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const dataWithProof = {
        ...data,
        paymentProofUrl: data.paymentProofUrl || "",
      }
      const id = await PaymentService.submitPaymentConfirmation(dataWithProof)
      onConfirmed({ ...data, id })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim data")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-2">Konfirmasi WhatsApp</h1>
        <p className="text-center text-green-100">Langkah 3: Kirim pesan WhatsApp ke admin</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              3
            </span>
            Kirim pesan WhatsApp ke admin
          </h3>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border">
              <h4 className="font-semibold text-gray-800 mb-2">Template Pesan:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono whitespace-pre-wrap">{whatsappMessage}</div>
            </div>

            <div className="text-center">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Kirim pesan WhatsApp ke admin
              </a>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappSent}
              onChange={(e) => setWhatsappSent(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                ✅ Saya sudah mengirim pesan konfirmasi ke admin melalui WhatsApp sesuai template yang ditentukan
              </span>
              {whatsappSent && (
                <div className="mt-2 flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Konfirmasi WhatsApp berhasil</span>
                </div>
              )}
            </div>
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pembayaran</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Nama:</span>
              <span className="font-semibold">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span>NIM:</span>
              <span className="font-semibold">{data.nim}</span>
            </div>
            <div className="flex justify-between">
              <span>Jumlah Pekan:</span>
              <span className="font-semibold">{data.weeks} pekan</span>
            </div>
            <div className="flex justify-between">
              <span>Kode Unik:</span>
              <span className="font-semibold">{data.uniqueCode}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-600">
              <span>Total:</span>
              <span>{formatCurrency(data.totalAmount)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <button
            onClick={handleConfirmSubmission}
            disabled={isSubmitting || !whatsappSent}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Konfirmasi & Simpan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
