"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Calculator, AlertCircle, Phone, QrCode } from "lucide-react"
import { ROLE_CONFIG, EVENT_CONFIG } from "../config/constants"
import { computeUniqueCode, formatCurrency, generateWhatsAppMessage } from "../utils/calculations"
import { validateForm } from "../utils/validation"
import type { PaymentData, FormErrors } from "../types"
import QRISGenerator from "./QRISGenerator"

interface PaymentFormProps {
  onSubmit: (data: PaymentData) => void
}

export default function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nim: "",
    phone: "62",
    role: "",
    paymentProof: null as File | null,
    waSent: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [calculatedData, setCalculatedData] = useState<{
    angkatan?: number
    uniqueCode?: number
    totalAmount?: number
  }>({})
  const [whatsappTemplate, setWhatsappTemplate] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  useEffect(() => {
    if (formData.nim && formData.role) {
      setIsCalculating(true)
      const result = computeUniqueCode(formData.nim)

      setTimeout(() => {
        if (result && ROLE_CONFIG[formData.role]) {
          const baseFee = ROLE_CONFIG[formData.role].baseFee
          const totalAmount = baseFee + result.uniqueCode

          setCalculatedData({
            angkatan: result.angkatan,
            uniqueCode: result.uniqueCode,
            totalAmount,
          })

          const template = generateWhatsAppMessage({
            name: formData.name || "[Nama Lengkap]",
            role: formData.role,
            nim: formData.nim,
            uniqueCode: result.uniqueCode,
            totalAmount,
            eventName: EVENT_CONFIG.name,
          })
          setWhatsappTemplate(template)
        } else {
          setCalculatedData({})
          setWhatsappTemplate("")
        }
        setIsCalculating(false)
      }, 500)
    } else {
      setCalculatedData({})
      setWhatsappTemplate("")
    }
  }, [formData.nim, formData.role, formData.name])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhoneChange = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, "")

    // Ensure it starts with 62
    let formattedValue = numericValue
    if (!numericValue.startsWith("62")) {
      if (numericValue.startsWith("8")) {
        formattedValue = "62" + numericValue
      } else if (numericValue.startsWith("0")) {
        formattedValue = "62" + numericValue.substring(1)
      } else if (numericValue.length > 0) {
        formattedValue = "62" + numericValue
      } else {
        formattedValue = "62"
      }
    }

    // Limit total length (62 + max 13 digits)
    if (formattedValue.length > 15) {
      formattedValue = formattedValue.substring(0, 15)
    }

    handleInputChange("phone", formattedValue)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationErrors = validateForm(formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!calculatedData.angkatan || !calculatedData.uniqueCode || !calculatedData.totalAmount) {
      return
    }

    const paymentData: PaymentData = {
      ...formData,
      angkatan: calculatedData.angkatan,
      uniqueCode: calculatedData.uniqueCode,
      baseFee: ROLE_CONFIG[formData.role].baseFee,
      totalAmount: calculatedData.totalAmount,
      timestamp: new Date().toISOString(),
    }

    onSubmit(paymentData)
  }

  const whatsappUrl = `https://wa.me/${EVENT_CONFIG.adminWhatsApp}?text=${encodeURIComponent(whatsappTemplate)}`

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-2">Konfirmasi Pembayaran</h1>
        <p className="text-center text-indigo-100">{EVENT_CONFIG.name}</p>
      </div>

      <div className="p-6">
        {/* Step 1: Form Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </span>
            Langkah 1: Isi data diri secara lengkap dan benar
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Informasi</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama lengkap"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="nama@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NIM</label>
                <input
                  type="text"
                  value={formData.nim}
                  onChange={(e) => handleInputChange("nim", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.nim ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="247411027"
                />
                {errors.nim && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.nim}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Nomor HP (WhatsApp)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                      errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="628123456789"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">+62</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Format: 62 diikuti nomor HP (contoh: 628123456789)</p>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.role ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Pilih Role --</option>
                  {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label} - {formatCurrency(config.baseFee)}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.role}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Calculation */}
            {formData.nim && formData.role && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-600" />
                  Perhitungan Biaya
                </h3>

                {isCalculating ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                    <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                    <div className="h-6 bg-blue-200 rounded w-2/3"></div>
                  </div>
                ) : calculatedData.uniqueCode ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Angkatan:</span>
                      <span className="font-semibold">20{calculatedData.angkatan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kode Unik:</span>
                      <span className="font-semibold">{calculatedData.uniqueCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Dasar:</span>
                      <span className="font-semibold">{formatCurrency(ROLE_CONFIG[formData.role].baseFee)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold text-indigo-600">
                      <span>Total Pembayaran:</span>
                      <span>{formatCurrency(calculatedData.totalAmount!)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">Format NIM tidak valid untuk perhitungan kode unik</p>
                )}
              </div>
            )}

            {/* Step 2: QRIS Payment */}
            {calculatedData.totalAmount && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Langkah 2: Scan QRIS untuk pembayaran otomatis
                </h3>
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <QRISGenerator amount={calculatedData.totalAmount} merchantName={EVENT_CONFIG.merchantName} />
                  </div>
                  <div className="bg-white p-4 rounded-xl border">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <p className="text-sm font-medium text-gray-700">QRIS Dinamis - Nominal Otomatis</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(calculatedData.totalAmount)}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Nominal sudah diatur otomatis dalam QRIS. Scan langsung untuk pembayaran.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!calculatedData.totalAmount}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Lanjut ke Konfirmasi WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
