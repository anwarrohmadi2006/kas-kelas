// Minimal QRIS helper: set amount and recompute CRC16-CCITT-FALSE

function crc16CcittFalse(bytes: Uint8Array): number {
  let crc = 0xffff
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i] << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
      crc &= 0xffff
    }
  }
  return crc
}

function buildTlv(pairs: Array<[string, string]>): string {
  return pairs
    .map(([tag, value]) => {
      const len = value.length.toString().padStart(2, "0")
      return `${tag}${len}${value}`
    })
    .join("")
}

function parseTlv(s: string): Array<[string, string]> {
  const res: Array<[string, string]> = []
  let i = 0
  while (i < s.length) {
    const tag = s.slice(i, i + 2)
    const len = Number.parseInt(s.slice(i + 2, i + 4), 10)
    const value = s.slice(i + 4, i + 4 + len)
    res.push([tag, value])
    i += 4 + len
  }
  return res
}

export function setAmountAndRecomputeCRC(qrStr: string, amount: number): string {
  const pairs = parseTlv(qrStr)
  const amtStr = amount.toFixed(2).replace(/\.00$/, "")
  const updated = pairs.map(([tag, val]) => (tag === "54" ? [tag, amtStr] : [tag, val])) as Array<[string, string]>
  const withoutCrc = buildTlv(updated.filter(([tag]) => tag !== "63"))
  const crcVal = crc16CcittFalse(new TextEncoder().encode(withoutCrc + "6304"))
  const crcHex = crcVal.toString(16).toUpperCase().padStart(4, "0")
  return withoutCrc + "6304" + crcHex
}
