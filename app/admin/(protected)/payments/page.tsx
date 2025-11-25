"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { PaymentService } from "@/services/paymentService"

type PaymentStatus = "pending" | "verified" | "rejected"

type PaymentRow = {
  id: string
  name: string
  nim: string
  phone?: string
  weeks?: number
  totalAmount: number
  status: PaymentStatus
  paymentProofUrl?: string | null
  waSent?: boolean
  createdAt?: string
  method: "qris" | "tunai"
}

const statusColor: Record<PaymentStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value)

const normalizePayment = (raw: any): PaymentRow => ({
  id: String(raw.id),
  name: raw.name ?? raw.nama ?? "-",
  nim: raw.nim ?? "-",
  phone: raw.phone ?? undefined,
  weeks: typeof raw.weeks === "number" ? raw.weeks : Number.parseInt(raw.weeks || "0", 10) || undefined,
  totalAmount: typeof raw.total_amount === "number" ? raw.total_amount : Number(raw.total_amount || 0),
  status: (raw.status || "pending") as PaymentStatus,
  paymentProofUrl: raw.payment_proof_url ?? null,
  waSent: raw.wa_sent ?? false,
  createdAt: raw.created_at ?? undefined,
  method: (raw.method as "qris" | "tunai") || (raw.payment_proof_url ? "qris" : "tunai"),
})

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [savingDetail, setSavingDetail] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<PaymentStatus>("pending")
  const [editMethod, setEditMethod] = useState<"qris" | "cash">("qris")

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await PaymentService.getAllPaymentConfirmations()
      setPayments(Array.isArray(data) ? data.map(normalizePayment) : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data pembayaran")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const selectPayment = (payment: PaymentRow) => {
    setSelectedId(payment.id)
    setEditStatus(payment.status)
    setEditMethod(payment.method)
  }

  const handleStatusChange = async (id: string, status: PaymentStatus) => {
    setUpdatingId(id)
    setError(null)
    try {
      await PaymentService.updatePaymentStatus(id, status)
      setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))
      if (selectedId === id) {
        setEditStatus(status)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengubah status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSaveDetail = async () => {
    if (!selectedId) return
    setSavingDetail(true)
    setError(null)
    try {
      await PaymentService.updatePayment(selectedId, { status: editStatus, method: editMethod })
      setPayments((prev) =>
        prev.map((p) => (p.id === selectedId ? { ...p, status: editStatus, method: editMethod } : p)),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan perubahan")
    } finally {
      setSavingDetail(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/payments/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Gagal menghapus pembayaran")
      setPayments((prev) => prev.filter((p) => p.id !== id))
      if (selectedId === id) {
        setSelectedId(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus pembayaran")
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    return payments.filter((pmt) => {
      const matchStatus = statusFilter === "all" ? true : pmt.status === statusFilter
      const matchSearch = `${pmt.id} ${pmt.name} ${pmt.nim}`.toLowerCase().includes(search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [payments, statusFilter, search])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Monitoring</p>
          <h1 className="text-xl font-semibold text-slate-900">Payments</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Filter by status</Badge>
          <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Pembayaran terbaru</CardTitle>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID/NIM/Nama"
              className="w-full sm:w-64"
            />
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as PaymentStatus | "all")}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>NIM</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-sm text-slate-500">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-sm text-slate-500">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((pmt) => (
                  <TableRow key={pmt.id}>
                  <TableCell className="font-medium">{pmt.id}</TableCell>
                  <TableCell>{pmt.name}</TableCell>
                  <TableCell>{pmt.nim}</TableCell>
                  <TableCell className="uppercase">{pmt.method === "qris" ? "QRIS" : "TUNAI / NON-QRIS"}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[pmt.status]}`}>{pmt.status}</span>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(pmt.totalAmount)}</TableCell>
                  <TableCell>
                      {pmt.createdAt ? format(new Date(pmt.createdAt), "dd MMM yyyy") : "-"}
                    </TableCell>
                    <TableCell className="space-x-2 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updatingId === pmt.id}
                        onClick={() => handleStatusChange(pmt.id, "verified")}
                      >
                        {updatingId === pmt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={updatingId === pmt.id}
                        onClick={() => handleStatusChange(pmt.id, "rejected")}
                      >
                        Tolak
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={updatingId === pmt.id}
                        onClick={() => handleStatusChange(pmt.id, "pending")}
                      >
                        Pending
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => selectPayment(pmt)}>
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-rose-600"
                        disabled={deletingId === pmt.id}
                        onClick={() => handleDelete(pmt.id)}
                      >
                        {deletingId === pmt.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedId && (
        <Card>
          <CardHeader>
            <CardTitle>Detail & Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {(() => {
              const current = payments.find((p) => p.id === selectedId)
              if (!current) return <p className="text-sm text-slate-500">Data tidak ditemukan.</p>

              return (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500">Nama</p>
                      <p className="font-semibold text-slate-900">{current.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">NIM</p>
                      <p className="font-semibold text-slate-900">{current.nim}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">HP</p>
                      <p className="font-semibold text-slate-900">{current.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Pekan</p>
                      <p className="font-semibold text-slate-900">{current.weeks || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(current.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Tanggal</p>
                      <p className="font-semibold text-slate-900">
                        {current.createdAt ? format(new Date(current.createdAt), "dd MMM yyyy HH:mm") : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Status</p>
                      <Select value={editStatus} onValueChange={(v) => setEditStatus(v as PaymentStatus)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500">Metode</p>
                      <Select value={editMethod} onValueChange={(v) => setEditMethod(v as "qris" | "cash")}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="qris">QRIS</SelectItem>
                          <SelectItem value="cash">Tunai / Non-QRIS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-x-2">
                      <Button onClick={handleSaveDetail} disabled={savingDetail}>
                        {savingDetail ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                      </Button>
                      <Button variant="outline" onClick={() => setSelectedId(null)}>
                        Tutup
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Bukti Bayar</p>
                    {current.paymentProofUrl ? (
                      <a
                        href={current.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 underline"
                      >
                        Lihat bukti
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500">Tidak ada bukti (kemungkinan tunai)</p>
                    )}
                  </div>
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
