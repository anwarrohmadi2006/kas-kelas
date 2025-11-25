import { RoleConfig } from '../types';

export const EVENT_CONFIG = {
  name: "Ajang Perkenalan Mahasiswa Sains Data (Analisa'25)",
  adminWhatsApp: "62895386208710",
  merchantName: "Digital Cell",
  // Base QRIS string untuk generator dinamis
  baseQRIS: "00020101021126610014COM.GO-JEK.WWW01189360091432646524520210G2646524520303UMI51440014ID.CO.QRIS.WWW0215ID10243264534600303UMI5204599953033605802ID5912Digital Cell6009SUKOHARJO61055755262070703A016304342D"
};

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  mahasiswa_baru: {
    baseFee: 60000,
    label: "Mahasiswa Baru",
    description: "Peserta Ajang Perkenalan Mahasiswa Sains Data (Analisa'25)"
  }
};


export const ANGKATAN_OFFSET: Record<number, number> = {
  25: 100
};
