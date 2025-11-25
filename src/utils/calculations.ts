import { ANGKATAN_OFFSET } from '../config/constants';

export function computeUniqueCode(nim: string): { angkatan: number; uniqueCode: number } | null {
  if (!/^[0-9]+$/.test(nim) || nim.length < 4) {
    return null;
  }
  
  const angkatanStr = nim.substring(0, 2);
  const angkatan = parseInt(angkatanStr, 10);
  
  if (![23, 24, 25].includes(angkatan)) {
    return null;
  }
  
  const last2Str = nim.slice(-2);
  const last2 = parseInt(last2Str, 10);
  const offset = ANGKATAN_OFFSET[angkatan];
  
  return {
    angkatan,
    uniqueCode: offset + last2
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

export function generateWhatsAppMessage(data: {
  name: string;
  role: string;
  nim: string;
  uniqueCode: number;
  totalAmount: number;
  eventName: string;
}): string {
  return `Halo Admin, saya ${data.name} (${data.role.replace('_', ' ')}), NIM: ${data.nim}, ingin konfirmasi pembayaran untuk ${data.eventName}. Kode unik: ${data.uniqueCode}, jumlah: ${formatCurrency(data.totalAmount)}. Mohon lampirkan bukti transfer setelah pesan ini.`;
}
