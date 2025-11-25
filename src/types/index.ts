export interface PaymentData {
  name: string;
  email: string;
  nim: string;
  phone: string;
  role: 'mahasiswa_baru' | 'panitia' | 'volunteer';
  angkatan: number;
  uniqueCode: number;
  baseFee: number;
  totalAmount: number;
  paymentProof: File | null;
  paymentProofUrl?: string;
  waSent: boolean;
  timestamp: string;
}

export interface RoleConfig {
  baseFee: number;
  label: string;
  description: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  nim?: string;
  phone?: string;
  role?: string;
  paymentProof?: string;
  waSent?: string;
}
