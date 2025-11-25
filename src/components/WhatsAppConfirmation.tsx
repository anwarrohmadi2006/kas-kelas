import React, { useState } from 'react';
import { MessageCircle, ArrowLeft, CheckCircle, AlertCircle, Loader2, Phone, Copy } from 'lucide-react';
import { PaymentData } from '../types';
import { formatCurrency, generateWhatsAppMessage } from '../utils/calculations';
import { EVENT_CONFIG } from '../config/constants';
import { PaymentService } from '../services/paymentService';

interface WhatsAppConfirmationProps {
  data: PaymentData;
  onBack: () => void;
  onConfirmed: (data: PaymentData & { id: string }) => void;
}

export default function WhatsAppConfirmation({ data, onBack, onConfirmed }: WhatsAppConfirmationProps) {
  const [waSent, setWaSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [messageCopied, setMessageCopied] = useState(false);

  const whatsappMessage = generateWhatsAppMessage({
    name: data.name,
    role: data.role,
    nim: data.nim,
    uniqueCode: data.uniqueCode,
    totalAmount: data.totalAmount,
    eventName: EVENT_CONFIG.name
  });

  const whatsappUrl = `https://wa.me/${EVENT_CONFIG.adminWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(whatsappMessage);
      setMessageCopied(true);
      setTimeout(() => setMessageCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleSubmit = async () => {
    if (!waSent) {
      setError('Anda harus mengirim pesan WhatsApp terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const paymentId = await PaymentService.submitPaymentConfirmation(data);
      onConfirmed({ ...data, id: paymentId });
    } catch (error) {
      console.error('Error submitting payment:', error);
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-8 text-white">
        <h1 className="text-3xl font-bold text-center mb-2">Konfirmasi WhatsApp</h1>
        <p className="text-center text-green-100">Langkah terakhir sebelum mengirim data</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ringkasan Pembayaran</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nama</label>
              <p className="text-lg font-semibold text-gray-800">{data.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">NIM</label>
              <p className="text-lg font-semibold text-gray-800">{data.nim}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Kode Unik</label>
              <p className="text-lg font-semibold text-gray-800">{data.uniqueCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Total Pembayaran</label>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(data.totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Kirim Pesan WhatsApp ke Admin
          </h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Template pesan:</p>
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {messageCopied ? 'Tersalin!' : 'Salin'}
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded border text-sm font-mono text-gray-800 max-h-32 overflow-y-auto">
                {whatsappMessage}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5" />
                Buka WhatsApp & Kirim Pesan
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                +{EVENT_CONFIG.adminWhatsApp}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                <strong>Penting:</strong> Pastikan Anda mengirim pesan WhatsApp sesuai template di atas kepada admin, serta melampirkan bukti pembayaran. 
                Setelah mengirim pesan, centang kotak konfirmasi di bawah ini.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Checkbox */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={waSent}
              onChange={(e) => setWaSent(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 disabled:opacity-50"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">
                ✅ Saya telah mengirim pesan konfirmasi pembayaran kepada admin melalui WhatsApp sesuai template yang ditentukan, serta melampirkan bukti pembayaran.
              </span>
              {waSent && (
                <div className="mt-2 flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Konfirmasi WhatsApp berhasil</span>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali ke Form
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!waSent || isSubmitting}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mengirim Data...
              </>
            ) : (
              'Kirim Konfirmasi Pembayaran'
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Setelah mengirim pesan WhatsApp dan mengkonfirmasi, data Anda akan tersimpan di database 
            dan menunggu verifikasi dari admin.
          </p>
        </div>
      </div>
    </div>
  );
}
