import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";

/** =====================
 *  EMV / QRIS helpers
 *  ===================== */
function crc16CcittFalse(bytes: Uint8Array): number {
  let crc = 0xffff;
  for (const b of bytes) {
    let x = (b & 0xff) << 8;
    crc ^= x;
    for (let i = 0; i < 8; i++) {
      const msb = crc & 0x8000;
      crc = (crc << 1) & 0xffff;
      if (msb) crc ^= 0x1021;
    }
  }
  return crc & 0xffff;
}

function parseTlv(s: string): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  let i = 0;
  while (i + 4 <= s.length) {
    const tag = s.slice(i, i + 2);
    const lenStr = s.slice(i + 2, i + 4);
    if (!/^\d{2}$/.test(lenStr)) break;
    const L = parseInt(lenStr, 10);
    i += 4;
    const val = s.slice(i, i + L);
    out.push([tag, val]);
    i += L;
  }
  return out;
}

function buildTlv(pairs: Array<[string, string]>): string {
  return pairs.map(([t, v]) => `${t}${String(v.length).padStart(2, "0")}${v}`).join("");
}

/** Posisikan/replace Tag 54 setelah Tag 53, lalu hitung ulang Tag 63 (CRC) */
function setAmountAndRecomputeCRC(qrStr: string, amountStr: string): string {
  const pairs = parseTlv(qrStr);
  const without63 = pairs.filter(([t]) => t !== "63");

  // replace jika sudah ada Tag 54
  let placed = false;
  for (let i = 0; i < without63.length; i++) {
    if (without63[i][0] === "54") {
      without63[i] = ["54", amountStr];
      placed = true;
      break;
    }
  }
  // sisipkan setelah Tag 53 bila belum ada
  if (!placed) {
    let idx = without63.findIndex(([t]) => t === "53");
    if (idx < 0) idx = without63.length - 1;
    without63.splice(idx + 1, 0, ["54", amountStr]);
  }

  const body = buildTlv(without63);
  const dataForCrc = new TextEncoder().encode(body + "6304");
  const crc = crc16CcittFalse(dataForCrc).toString(16).toUpperCase().padStart(4, "0");
  return body + "6304" + crc;
}

interface QRISGeneratorProps {
  amount: number;
  merchantName?: string;
  className?: string;
}

export default function QRISGenerator({ amount, merchantName = "Digital Cell", className = "" }: QRISGeneratorProps) {
  // Base QRIS string (open amount) - you can replace this with your actual merchant QRIS
  const baseQRIS = "00020101021126610014COM.GO-JEK.WWW01189360091432646524520210G2646524520303UMI51440014ID.CO.QRIS.WWW0215ID10243264534600303UMI5204599953033605802ID5912Digital Cell6009SUKOHARJO61055755262070703A016304342D";

  const finalQRIS = useMemo(() => {
    if (!amount || amount <= 0) return "";
    
    try {
      // Convert amount to string (IDR format without decimals)
      const amountStr = String(Math.floor(amount));
      return setAmountAndRecomputeCRC(baseQRIS, amountStr);
    } catch (error) {
      console.error("Error generating QRIS:", error);
      return "";
    }
  }, [amount]);

  if (!finalQRIS) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}>
        <p className="text-gray-500">QRIS tidak dapat dibuat</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <QRCodeSVG 
          value={finalQRIS} 
          size={256} 
          includeMargin 
          level="M"
          className="w-full h-auto"
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{merchantName}</p>
        <p className="text-xs text-gray-500">Scan untuk pembayaran Rp{amount.toLocaleString('id-ID')}</p>
      </div>
    </div>
  );
}
