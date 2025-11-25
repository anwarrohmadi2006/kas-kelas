"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { EVENT_CONFIG } from "../config/constants"
import {
  computeUniqueCode,
  formatCurrency,
  generateWhatsAppMessage,
  calculateTotalPayment,
} from "../utils/calculations"
import { validateForm } from "../utils/validation"
import type { PaymentData, FormErrors } from "../types"

interface PaymentFormProps {
  onSubmit: (data: PaymentData) => void
}

const UploadIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

const CalculatorIcon = () => (
  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const AlertCircleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

export default function PaymentForm({ onSubmit }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nim: "",
    phone: "62",
    weeks: "", // legacy field
    paymentProof: null as File | null,
    waSent: false,
    method: "qris" as "qris" | "tunai",
  })

  const [periods, setPeriods] = useState<Array<{ id: number; nama: string; nominal: number; kode: string }>>([])
  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([])
  const [studentInfo, setStudentInfo] = useState<{ nimMasked: string; namaSingkat: string } | null>(null)
  const [nimError, setNimError] = useState<string | null>(null)
  const [checkingNim, setCheckingNim] = useState(false)

  const [errors, setErrors] = useState<FormErrors>({})
  const [calculatedData, setCalculatedData] = useState<{
    uniqueCode?: number
    totalAmount?: number
  }>({})
  const [whatsappTemplate, setWhatsappTemplate] = useState("")
  const [isCalculating, setIsCalculating] = useState(false)

  const loadPeriodsForNim = async (nim: string) => {
    setCheckingNim(true)
    setNimError(null)
    try {
      const res = await fetch(`/api/students/${nim}`)
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error?.message || "NIM tidak ditemukan")
      }
      setStudentInfo(data.data?.student || null)
      const bills = data.data?.bills || []
      const unpaid = bills.filter((b: any) => b.status !== "paid" && b.status !== "paid_off")
      setPeriods(
        unpaid.map((b: any) => ({
          id: b.period_id,
          nama: b.nama || b.kode,
          nominal: b.nominal,
          kode: b.kode,
        })),
      )
      setSelectedPeriods([])
    } catch (err) {
      setStudentInfo(null)
      setPeriods([])
      setSelectedPeriods([])
      setNimError(err instanceof Error ? err.message : "Gagal cek NIM")
      setCalculatedData({})
      setWhatsappTemplate("")
    } finally {
      setCheckingNim(false)
    }
  }

  useEffect(() => {
    if (formData.nim && selectedPeriods.length > 0) {
      setIsCalculating(true)
      const result = computeUniqueCode(formData.nim)
      const totalAmount = selectedPeriods
        .map((id) => periods.find((p) => p.id === id)?.nominal || 0)
        .reduce((a, b) => a + b, 0)

      setTimeout(() => {
        if (result && totalAmount > 0) {
          setCalculatedData({
            uniqueCode: result.uniqueCode,
            totalAmount,
          })

          const template = generateWhatsAppMessage({
            name: formData.name || "[Nama Lengkap]",
            weeks: selectedPeriods.length,
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
      }, 300)
    } else {
      setCalculatedData({})
      setWhatsappTemplate("")
    }
  }, [formData.nim, formData.name, selectedPeriods, periods])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "")

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

    if (formattedValue.length > 15) {
      formattedValue = formattedValue.substring(0, 15)
    }

    handleInputChange("phone", formattedValue)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    handleInputChange("paymentProof", file)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (selectedPeriods.length === 0) {
      setErrors({ weeks: "Pilih minimal satu periode" })
      return
    }

    const weeksNumber = selectedPeriods.length

    const validationData = {
      ...formData,
      weeks: weeksNumber,
    }
    const validationErrors = validateForm(validationData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!calculatedData.uniqueCode || !calculatedData.totalAmount) {
      return
    }

    const paymentData: PaymentData = {
      ...formData,
      weeks: weeksNumber,
      uniqueCode: calculatedData.uniqueCode,
      weeklyFee: calculatedData.totalAmount / weeksNumber,
      totalAmount: calculatedData.totalAmount,
      timestamp: new Date().toISOString(),
      method: formData.method,
      periodIds: selectedPeriods,
    }

    onSubmit(paymentData)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
      <div className="bg-indigo-900 px-6 py-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Konfirmasi Pembayaran Kas Kelas</h1>
        <p className="text-center text-indigo-200">{EVENT_CONFIG.name}</p>
      </div>

      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
            <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              1
            </span>
            Langkah 1 dari 3: Isi data diri secara lengkap dan benar
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                    <AlertCircleIcon />
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
                    <AlertCircleIcon />
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
                <button
                  type="button"
                  onClick={() => formData.nim && loadPeriodsForNim(formData.nim)}
                  disabled={checkingNim || !formData.nim}
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {checkingNim ? "Mengecek..." : "Cek NIM & Periode"}
                </button>
                {nimError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircleIcon />
                    {nimError}
                  </p>
                )}
                {studentInfo && (
                  <p className="mt-1 text-sm text-green-700">
                    Ditemukan: {studentInfo.namaSingkat} ({studentInfo.nimMasked})
                  </p>
                )}
                {errors.nim && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircleIcon />
                    {errors.nim}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon />
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
                    <AlertCircleIcon />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Periode yang Dibayar</label>
                <div className="space-y-2 max-h-56 overflow-auto border rounded-xl p-3">
                  {periods.length === 0 ? (
                    <p className="text-sm text-gray-500">Periode belum tersedia.</p>
                  ) : (
                    periods.map((p) => (
                      <label key={p.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedPeriods.includes(p.id)}
                          onChange={(e) => {
                            setSelectedPeriods((prev) =>
                              e.target.checked ? [...prev, p.id] : prev.filter((id) => id !== p.id),
                            )
                          }}
                        />
                        <span className="text-sm">
                          {p.nama} ({p.kode}) - {formatCurrency(p.nominal)}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {errors.weeks && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircleIcon />
                    {errors.weeks}
                  </p>
                )}
              </div>
            </div>

            {formData.nim && formData.weeks && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CalculatorIcon />
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
                      <span>Kode Unik (2 digit terakhir NIM):</span>
                      <span className="font-semibold">{calculatedData.uniqueCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jumlah Pekan:</span>
                      <span className="font-semibold">{formData.weeks} pekan</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Kas:</span>
                      <span className="font-semibold">
                        {formatCurrency(WEEKLY_FEE * Number.parseInt(formData.weeks))}
                      </span>
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

            <button
              type="submit"
              disabled={!calculatedData.totalAmount}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              Lanjut ke Pembayaran QRIS
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
