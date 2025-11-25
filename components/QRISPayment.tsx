"use client"
import { useState } from "react"
import type React from "react"

import { CheckCircle2, Smartphone, CreditCard, Upload, X } from "lucide-react"
import QRISGenerator from "../src/components/QRISGenerator"

/** =====================
 *  UI helpers
 *  ===================== */
const formatRupiah = (n: string | number) => {
  const s = String(n)
  const digits = s.replace(/\D/g, "")
  if (!digits) return ""
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/** =====================
 *  Komponen Utama
 *  ===================== */
export default function QRISPayment({
  paymentData,
  onBack,
  onNext,
}: {
  paymentData: {
    nama: string
    nim: string
    weeks: number
    uniqueCode: number
    total: number
  }
  onBack: () => void
  onNext: (paymentProofUrl?: string) => void // Changed to pass URL instead of File
}) {
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>("")
  const [uploadError, setUploadError] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  const uploadToBlob = async (file: File) => {
    setIsUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("nim", paymentData.nim)

      console.log("[v0] Uploading file to blob storage...")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Upload failed")
      }

      console.log("[v0] Upload successful:", result.url)
      setPaymentProofUrl(result.url)
      return result.url
    } catch (error) {
      console.error("[v0] Upload error:", error)
      setUploadError(error instanceof Error ? error.message : "Upload gagal")
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Format file tidak didukung. Gunakan JPG, PNG, atau PDF.")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file terlalu besar. Maksimal 5MB.")
      return
    }

    setPaymentProof(file)

    await uploadToBlob(file)
  }

  const removeFile = () => {
    setPaymentProof(null)
    setPaymentProofUrl("")
    setUploadError("")
  }

  const handleNext = () => {
    onNext(paymentProofUrl || undefined)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <span className="bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Langkah 2 dari 3
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pembayaran QRIS</h1>
          <p className="text-gray-600">Scan QR code untuk melakukan pembayaran dengan mudah</p>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Ringkasan Pembayaran
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Nama</span>
              <span className="font-medium text-gray-800">{paymentData.nama}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">NIM</span>
              <span className="font-medium text-gray-800">{paymentData.nim}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Kode Unik</span>
              <span className="font-medium text-gray-800">{paymentData.uniqueCode}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl px-4 mt-4">
              <span className="text-lg font-semibold text-gray-800">Total Pembayaran</span>
              <span className="text-2xl font-bold text-indigo-600">
                Rp {formatRupiah(paymentData.total.toString())}
              </span>
            </div>
          </div>
        </div>

        {/* QRIS Payment Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Smartphone className="w-6 h-6 text-indigo-600" />
              <h3 className="text-xl font-semibold text-gray-800">Scan untuk Membayar</h3>
            </div>

            <div className="flex justify-center mb-6">
              <QRISGenerator
                amount={paymentData.total}
                merchantName="Digital Cell"
                className="bg-gray-50 p-4 rounded-2xl"
              />
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-800">Nominal Otomatis Terisi</p>
              </div>
              <p className="text-sm text-green-700">QR code sudah berisi nominal yang tepat. Cukup scan dan bayar!</p>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <p>• Buka aplikasi mobile banking atau e-wallet</p>
              <p>• Pilih menu "Scan QR" atau "QRIS"</p>
              <p>• Arahkan kamera ke QR code di atas</p>
              <p>• Konfirmasi pembayaran di aplikasi</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Upload Bukti Pembayaran
          </h3>

          {!paymentProof ? (
            <div>
              <label htmlFor="payment-proof" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">Klik untuk upload bukti pembayaran</p>
                  <p className="text-sm text-gray-500">JPG, PNG, atau PDF • Maksimal 5MB</p>
                </div>
              </label>
              <input
                id="payment-proof"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {uploadError && <p className="text-red-500 text-sm mt-2 text-center">{uploadError}</p>}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">{paymentProof.name}</p>
                    <p className="text-sm text-green-600">{(paymentProof.size / 1024 / 1024).toFixed(2)} MB</p>
                    {isUploading && <p className="text-sm text-blue-600">Mengupload...</p>}
                    {paymentProofUrl && <p className="text-xs text-green-600">✓ Tersimpan di cloud storage</p>}
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
            disabled={isUploading}
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={!paymentProofUrl || isUploading} // Check for URL instead of file
            className={`flex-1 px-6 py-3 font-semibold rounded-xl transition-all shadow-lg ${
              paymentProofUrl && !isUploading
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isUploading ? "Mengupload..." : "Saya Sudah Bayar"}
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Setelah pembayaran berhasil, upload bukti pembayaran dan klik "Saya Sudah Bayar"
          </p>
        </div>
      </div>
    </div>
  )
}
