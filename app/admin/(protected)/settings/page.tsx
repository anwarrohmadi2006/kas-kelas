"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Shield, Save } from "lucide-react"
import { useEffect } from "react"

export default function AdminSettingsPage() {
  const [googleSheetId, setGoogleSheetId] = useState("")
  const [qrisBase, setQrisBase] = useState("")
  const [fonnteConfigured, setFonnteConfigured] = useState(false)
  const [autoReminder, setAutoReminder] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (res.ok && data.ok) {
          setGoogleSheetId(data.data?.google_sheet_id || "")
          setQrisBase(data.data?.qris_base_open_amount || "")
          setAutoReminder(Boolean(data.data?.auto_reminder_enabled ?? true))
          setFonnteConfigured(Boolean(data.data?.fonnte_configured ?? false))
        }
      } catch {
        // ignore
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_sheet_id: googleSheetId,
          qris_base_open_amount: qrisBase,
          auto_reminder_enabled: autoReminder,
          fonnte_configured: fonnteConfigured,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Gagal simpan settings")
      setMessage("Settings disimpan")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal simpan")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Konfigurasi</p>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Google Sheet (legacy)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="sheetId">Spreadsheet ID</Label>
              <Input id="sheetId" value={googleSheetId} onChange={(e) => setGoogleSheetId(e.target.value)} />
            </div>
            <p className="text-xs text-slate-500">Digunakan untuk bridging data lama, tidak dikirim ke client publik.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">QRIS Base String</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="qrisBase">Base open-amount EMV</Label>
            <Input id="qrisBase" value={qrisBase} onChange={(e) => setQrisBase(e.target.value)} />
            <p className="text-xs text-slate-500">Disimpan di env atau app_settings, tidak diekspos ke client.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Fonnte WhatsApp</CardTitle>
            <Shield className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Token configured?</span>
              <Switch checked={fonnteConfigured} onCheckedChange={setFonnteConfigured} />
            </div>
            <p className="text-xs text-slate-500">Token hanya di server environment, tidak disimpan di DB.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reminder Otomatis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-700">Aktifkan jadwal auto-reminder</span>
              <Switch checked={autoReminder} onCheckedChange={setAutoReminder} />
            </div>
            <p className="text-xs text-slate-500">
              Jadwal dan template diambil dari app_settings dengan prioritas env override sesuai kebijakan keamanan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
