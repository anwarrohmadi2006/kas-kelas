"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"

const kpiCards = [
  { label: "Total Kas Masuk", value: "Rp 24.650.000" },
  { label: "Total Kas Keluar", value: "Rp 5.420.000" },
  { label: "Saldo", value: "Rp 19.230.000" },
  { label: "Siswa Lunas", value: "18 / 29" },
]

const chartData = [
  { periode: "Sep 24", masuk: 2500000 },
  { periode: "Okt 24", masuk: 3200000 },
  { periode: "Feb 25", masuk: 4100000 },
  { periode: "Mar 25", masuk: 4500000 },
]

const statusData = [
  { name: "Lunas", value: 18, color: "#4f46e5" },
  { name: "Menunggak", value: 9, color: "#22c55e" },
  { name: "Belum Bayar", value: 2, color: "#f97316" },
]

const expenses = [
  { tanggal: "2025-11-18", kategori: "Kebutuhan Kelas", amount: 250000 },
  { tanggal: "2025-10-28", kategori: "Perlengkapan", amount: 180000 },
  { tanggal: "2025-10-10", kategori: "Acara", amount: 600000 },
]

export default function PublicDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500">Transparansi</p>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard Kas Kelas</h1>
          </div>
          <Badge variant="secondary">Tidak ada PII ditampilkan</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-slate-900">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Kas Masuk per Periode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="periode" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="masuk" stroke="#4f46e5" fill="#c7d2fe" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi Status Bayar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={4}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2">
                {statusData.map((entry) => (
                  <Badge key={entry.name} variant="outline" style={{ borderColor: entry.color, color: entry.color }}>
                    {entry.name}: {entry.value} siswa
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-base">Pengeluaran Terbaru</CardTitle>
            <Badge variant="outline">Sample data</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.tanggal + exp.kategori}>
                    <TableCell>{exp.tanggal}</TableCell>
                    <TableCell>{exp.kategori}</TableCell>
                    <TableCell className="text-right">Rp {exp.amount.toLocaleString("id-ID")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-slate-500 mt-3">
              Tidak ada nomor WhatsApp, email, atau bukti pembayaran yang ditampilkan di dashboard publik.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
