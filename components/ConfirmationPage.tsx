"use client"
import { CheckCircle, ArrowLeft, Download } from "lucide-react"
import type { PaymentData } from "../types"
import { formatCurrency } from "../utils/calculations"

interface ConfirmationPageProps {
  data: PaymentData & { id: string }
  onBack: () => void
}

export default function ConfirmationPage({ data, onBack }: ConfirmationPageProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-8 text-white">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Pembayaran Berhasil!</h1>
          <p className="text-emerald-100">Data pembayaran telah tersimpan</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Konfirmasi</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>ID Pembayaran:</span>
              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{data.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Nama:</span>
              <span className="font-semibold">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span className="font-semibold">{data.email}</span>
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
            <div className="border-t pt-3 flex justify-between text-lg font-bold text-emerald-600">
              <span>Total Pembayaran:</span>
              <span>{formatCurrency(data.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Langkah Selanjutnya</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <p>Admin akan memverifikasi pembayaran Anda dalam 1x24 jam</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <p>Anda akan mendapat konfirmasi via WhatsApp setelah pembayaran diverifikasi</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <p>Simpan ID pembayaran ini untuk referensi</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <button
            onClick={() => window.print()}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Cetak/Simpan
          </button>
        </div>
      </div>
    </div>
  )
}
