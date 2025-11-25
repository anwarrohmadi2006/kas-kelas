"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BellRing, Loader2 } from "lucide-react"

const previewMessage = `Reminder Pembayaran Kas Kelas

Hi {{nama}},
Makasih ya, catatan pembayaran kas kamu udah masuk sejumlah Rp{{totalBayar}} ({{jumlahBulanDibayar}}x bayar).

Sekadar info, total pembayaran yang seharusnya sesuai jadwal sampai sekarang adalah {{bulanSeharusnya}} kali. Jadi, masih ada sisa tagihan Rp{{tagihan}}.

Berikut rincian periode yang perlu diselesaikan:
{{listBulanText}}

Yok bisa yok dilunasin sat set!`

export default function AdminRemindersPage() {
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(previewMessage)
  const [targets, setTargets] = useState("6281234567890")
  const [error, setError] = useState<string | null>(null)

  const handlePreview = async () => {
    setError(null)
    try {
      const res = await fetch("/api/admin/reminders/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "demo", template: preview, variables: {} }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Preview gagal")
      setPreview(data.data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview gagal")
    }
  }

  const handleSend = async () => {
    setSending(true)
    setError(null)
    try {
      const list = targets
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean)
      const res = await fetch("/api/admin/reminders/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets: list, message: preview }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Kirim gagal")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirim gagal")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Automation</p>
          <h1 className="text-xl font-semibold text-slate-900">Reminders</h1>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <BellRing className="w-4 h-4" /> Fonnte
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview pesan (unpaid)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={preview} onChange={(e) => setPreview(e.target.value)} className="font-mono text-sm h-48" />
          <div>
            <label className="text-xs text-slate-500">Targets (pisahkan dengan spasi atau koma)</label>
            <Textarea value={targets} onChange={(e) => setTargets(e.target.value)} className="text-sm h-16" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="text-xs text-slate-500">
            Template ditarik dari app_settings, placeholder diganti dinamis (nama, tagihan, periode). Token Fonnte tidak pernah dikirim ke
            client.
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePreview} variant="outline" className="gap-2">
              Preview
            </Button>
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <BellRing className="w-4 h-4" />}
              Kirim batch (stub)
            </Button>
            <span className="text-xs text-slate-500">
              Rate limit: 20 pesan lalu jeda 60 detik. Implementasi backend akan menghormati kebijakan ini.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
