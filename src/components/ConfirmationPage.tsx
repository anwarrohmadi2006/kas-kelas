import React from 'react';
import { CheckCircle, Download, MessageCircle, ArrowLeft, FileText, Calculator, Phone } from 'lucide-react';
import { PaymentData } from '../types';
import { formatCurrency, generateWhatsAppMessage } from '../utils/calculations';
import { ROLE_CONFIG, EVENT_CONFIG } from '../config/constants';

interface ConfirmationPageProps {
  data: PaymentData & { id: string };
  onBack: () => void;
}

export default function ConfirmationPage({ data, onBack }: ConfirmationPageProps) {
  const whatsappMessage = generateWhatsAppMessage({
    name: data.name,
    role: data.role,
    nim: data.nim,
    uniqueCode: data.uniqueCode,
    totalAmount: data.totalAmount,
    eventName: EVENT_CONFIG.name
  });

  const whatsappUrl = `https://wa.me/${EVENT_CONFIG.adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Konfirmasi Berhasil Dikirim!</h1>
          <p className="text-green-100">Data pembayaran Anda telah tersimpan di sistem</p>
          <p className="text-sm text-green-200 mt-2">ID Konfirmasi: {data.id}</p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Informasi 
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nama Lengkap</label>
              <p className="text-lg font-semibold text-gray-800">{data.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg font-semibold text-gray-800">{data.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">NIM</label>
              <p className="text-lg font-semibold text-gray-800">{data.nim}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Nomor HP
              </label>
              <p className="text-lg font-semibold text-gray-800">+{data.phone}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Role</label>
              <p className="text-lg font-semibold text-gray-800">
                {ROLE_CONFIG[data.role].label}
              </p>
            </div>
          </div>
        </div>
        
        {/* File Upload Status */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Data Berhasil Tersimpan di Database
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
              <Download className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-800">Bukti pembayaran berhasil diunggah</p>
                <p className="text-sm text-gray-600">
                  Tersimpan di Supabase Storage • Diunggah pada {new Date(data.timestamp).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <p className="text-sm text-green-700">
              Status: <span className="font-semibold">Menunggu Verifikasi Admin</span>
            </p>
          </div>
        </div>

        {/* Contact Admin */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Hubungi Admin
          </h3>
          <p className="text-gray-600 mb-4">
            Jika ada pertanyaan atau kendala, silakan hubungi admin melalui WhatsApp:
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Chat Admin WhatsApp
          </a>
        </div>

        {/* Event Info */}
        <div className="text-center bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{EVENT_CONFIG.name}</h3>
          <p className="text-gray-600">
            Terima kasih telah mendaftar! Data Anda telah tersimpan dengan aman di database kami. 
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-2xl hover:bg-gray-200 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali ke Form
        </button>
      </div>
    </div>
  );
}
