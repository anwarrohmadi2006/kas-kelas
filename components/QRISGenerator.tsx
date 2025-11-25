"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRISGeneratorProps {
  amount: number
  merchantName: string
}

export default function QRISGenerator({ amount, merchantName }: QRISGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QRIS data (simplified version)
      const qrisData = `00020101021226280014ID.CO.QRIS.WWW0118${merchantName}52044814530336054${amount.toString().padStart(10, "0")}5802ID5913${merchantName}6007Jakarta61051234062070703A016304`

      QRCode.toCanvas(canvasRef.current, qrisData, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [amount, merchantName])

  return (
    <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
      <canvas ref={canvasRef} className="mx-auto" />
    </div>
  )
}
