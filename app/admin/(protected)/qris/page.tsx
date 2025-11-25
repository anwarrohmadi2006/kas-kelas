"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import QRISGenerator from "../../../../components/QRISGenerator"
import { Badge } from "@/components/ui/badge"

export default function AdminQRISPage() {
  const [amount, setAmount] = useState(100000)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Utilities</p>
          <h1 className="text-xl font-semibold text-slate-900">QRIS Generator</h1>
        </div>
        <Badge variant="outline">Amount locking</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generate QR dengan nominal terkunci</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Input
              type="number"
              min={1000}
              value={amount}
              onChange={(e) => setAmount(Number.parseInt(e.target.value || "0", 10))}
              className="sm:w-64"
            />
            <Button onClick={() => setAmount((n) => Math.max(1000, n))}>Lock amount</Button>
          </div>
          <div className="flex justify-center">
            <QRISGenerator amount={amount} merchantName="Kas Kelas SDT 2024" className="bg-white p-4 rounded-xl shadow" />
          </div>
          <p className="text-xs text-slate-500">
            QRIS base string diambil dari env/app_settings. Helper akan memasukkan nominal dan menghitung CRC16-CCITT False.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
