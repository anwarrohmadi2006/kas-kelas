"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, PauseCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type PeriodRow = {
  id: number
  kode_periode: string
  nama_periode: string
  tanggal_mulai: string
  tanggal_selesai: string
  nominal: number
  is_active: boolean
}

export default function AdminPeriodsPage() {
  const [rows, setRows] = useState<PeriodRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    kode_periode: "",
    nama_periode: "",
    nominal: 10000,
    tanggal_mulai: "",
    tanggal_selesai: "",
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchPeriods = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/periods?limit=50")
        const data = await res.json()
        if (!res.ok || !data.ok) {
          throw new Error(data.error?.message || "Gagal memuat periode")
        }
        setRows(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat periode")
      } finally {
        setLoading(false)
      }
    }
    fetchPeriods()
  }, [])

  const handleCreate = async () => {
    if (!form.kode_periode || !form.nama_periode || !form.tanggal_mulai || !form.tanggal_selesai) {
      setError("Lengkapi kode/nama/tanggal")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Gagal membuat periode")
      await fetchPeriods()
      setForm({ kode_periode: "", nama_periode: "", nominal: 10000, tanggal_mulai: "", tanggal_selesai: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat periode")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Master data</p>
          <h1 className="text-xl font-semibold text-slate-900">Periods</h1>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <CalendarClock className="w-4 h-4" /> Active / inactive
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Periode kas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="grid md:grid-cols-5 gap-2 mb-4">
            <Input
              placeholder="Kode"
              value={form.kode_periode}
              onChange={(e) => setForm((p) => ({ ...p, kode_periode: e.target.value }))}
            />
            <Input
              placeholder="Nama"
              value={form.nama_periode}
              onChange={(e) => setForm((p) => ({ ...p, nama_periode: e.target.value }))}
            />
            <Input
              type="date"
              value={form.tanggal_mulai}
              onChange={(e) => setForm((p) => ({ ...p, tanggal_mulai: e.target.value }))}
            />
            <Input
              type="date"
              value={form.tanggal_selesai}
              onChange={(e) => setForm((p) => ({ ...p, tanggal_selesai: e.target.value }))}
            />
            <Input
              type="number"
              value={form.nominal}
              onChange={(e) => setForm((p) => ({ ...p, nominal: Number(e.target.value) || 0 }))}
            />
            <Button className="md:col-span-5" onClick={handleCreate} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah Periode"}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Periode</TableHead>
                <TableHead>Rentang</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin inline-block text-slate-500" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-sm text-slate-500">
                    Tidak ada periode
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((period) => (
                  <TableRow key={period.id}>
                    <TableCell className="font-medium">{period.kode_periode}</TableCell>
                    <TableCell>{period.nama_periode}</TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-600">
                        {period.tanggal_mulai} - {period.tanggal_selesai}
                      </div>
                    </TableCell>
                    <TableCell>Rp {Number(period.nominal).toLocaleString("id-ID")}</TableCell>
                    <TableCell>
                      <Badge variant={period.is_active ? "outline" : "secondary"} className="inline-flex items-center gap-1">
                        {period.is_active ? (
                          <>
                            <CalendarClock className="w-4 h-4" /> Active
                          </>
                        ) : (
                          <>
                            <PauseCircle className="w-4 h-4" /> Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
