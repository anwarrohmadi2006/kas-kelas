"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Wallet, Users, CheckCircle, Clock3 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"

const kpiData = [
  { label: "Saldo", value: "Rp 12.450.000", delta: "+5% vs minggu lalu", trend: "up" },
  { label: "Kas Masuk (bulan ini)", value: "Rp 6.200.000", delta: "+12%", trend: "up" },
  { label: "Kas Keluar (bulan ini)", value: "Rp 1.850.000", delta: "-3%", trend: "down" },
  { label: "Menunggu Verifikasi", value: "8 pembayaran", delta: "perlu review", trend: "neutral" },
]

const incomeData = [
  { periode: "Sep", masuk: 2500000, keluar: 750000 },
  { periode: "Okt", masuk: 3200000, keluar: 950000 },
  { periode: "Nov", masuk: 4500000, keluar: 1100000 },
]

const studentStatus = [
  { label: "Lunas", value: 18, color: "rgb(79 70 229)" },
  { label: "Menunggak", value: 9, color: "rgb(34 197 94)" },
  { label: "Belum Bayar", value: 2, color: "rgb(248 113 113)" },
]

const pendingPayments = [
  { id: "PMT-1023", name: "Anwar Rohmadi", nim: "247411027", amount: "Rp 120.000", metode: "qris" },
  { id: "PMT-1024", name: "Naufal Ajwa", nim: "247411024", amount: "Rp 80.000", metode: "tunai" },
  { id: "PMT-1025", name: "Sandy Fredella", nim: "247411022", amount: "Rp 50.000", metode: "qris" },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Overview</p>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        </div>
        <Badge variant="outline">Staging data</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-500">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.delta}</p>
              </div>
              {kpi.trend === "up" ? (
                <ArrowUpRight className="w-5 h-5 text-emerald-600" />
              ) : kpi.trend === "down" ? (
                <ArrowDownRight className="w-5 h-5 text-rose-600" />
              ) : (
                <Clock3 className="w-5 h-5 text-amber-500" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kas Masuk vs Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periode" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="masuk" name="Kas Masuk" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="keluar" name="Kas Keluar" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performa Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periode" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="masuk" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="keluar" stroke="#22c55e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pembayaran Menunggu Verifikasi</CardTitle>
            <Badge variant="secondary">{pendingPayments.length} items</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingPayments.map((pmt) => (
                <div key={pmt.id} className="flex items-center justify-between border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
                      {pmt.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{pmt.name}</p>
                      <p className="text-xs text-slate-500">
                        {pmt.nim} • {pmt.metode.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{pmt.amount}</p>
                    <p className="text-xs text-indigo-600">Klik untuk verifikasi</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Siswa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {studentStatus.map((status) => (
              <div key={status.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }}></div>
                  <p className="text-sm text-slate-700">{status.label}</p>
                </div>
                <p className="font-semibold text-slate-900">{status.value} siswa</p>
              </div>
            ))}
            <div className="mt-4 border rounded-lg p-3 bg-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Wallet className="w-4 h-4" />
                Cash reserve sehat, distribusi lunas >70%.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
