"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type CashRow = { id: number; jenis: "in" | "out"; sumber: string; amount: number; tanggal: string; keterangan?: string }

export default function AdminCashPage() {
  const [rows, setRows] = useState<CashRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ jenis: "in" as "in" | "out", sumber: "qris", amount: 0, keterangan: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchCash = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/cash-flows?limit=50")
        const data = await res.json()
        if (!res.ok || !data.ok) throw new Error(data.error?.message || "Gagal memuat cash flows")
        setRows(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat cash flows")
      } finally {
        setLoading(false)
      }
    }
    fetchCash()
  }, [])

  const handleCreate = async () => {
    if (!form.amount || form.amount <= 0) {
      setError("Amount harus diisi")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/cash-flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Gagal membuat cash flow")
      const refreshed = await fetch("/api/admin/cash-flows?limit=50")
      const rdata = await refreshed.json()
      if (refreshed.ok && rdata.ok) setRows(rdata.data || [])
      setForm({ jenis: "in", sumber: "qris", amount: 0, keterangan: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat cash flow")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Ledger</p>
          <h1 className="text-xl font-semibold text-slate-900">Cash Flows</h1>
        </div>
        <Badge variant="outline">Kas masuk/keluar</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kas terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="grid md:grid-cols-5 gap-2 mb-4">
            <Select value={form.jenis} onValueChange={(v) => setForm((p) => ({ ...p, jenis: v as "in" | "out" }))}>
              <SelectTrigger>
                <SelectValue placeholder="Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">In</SelectItem>
                <SelectItem value="out">Out</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Sumber"
              value={form.sumber}
              onChange={(e) => setForm((p) => ({ ...p, sumber: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) || 0 }))}
            />
            <Input
              placeholder="Keterangan"
              value={form.keterangan}
              onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))}
            />
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah"}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Sumber</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin inline-block text-slate-500" />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-sm text-slate-500">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="font-medium">{flow.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="inline-flex items-center gap-1">
                        {flow.jenis === "in" ? (
                          <>
                            <ArrowDownCircle className="w-4 h-4 text-emerald-600" /> In
                          </>
                        ) : (
                          <>
                            <ArrowUpCircle className="w-4 h-4 text-rose-600" /> Out
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="uppercase">{flow.sumber}</TableCell>
                    <TableCell>{flow.keterangan || "-"}</TableCell>
                    <TableCell>{flow.tanggal}</TableCell>
                    <TableCell className="text-right">Rp {flow.amount.toLocaleString("id-ID")}</TableCell>
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
