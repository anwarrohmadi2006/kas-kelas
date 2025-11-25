"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, UserCheck, UserX, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type StudentStatus = "active" | "inactive"

const statusColor: Record<StudentStatus, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-amber-100 text-amber-700",
}

export default function AdminStudentsPage() {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newStudent, setNewStudent] = useState({ nim: "", nama: "", status: "active" as StudentStatus, kelas: "", angkatan: "" })
  const [saving, setSaving] = useState(false)

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const paginated = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page])

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        params.set("limit", "100")
        if (query) params.set("q", query)
        const res = await fetch(`/api/admin/students?${params.toString()}`)
        const data = await res.json()
        if (!res.ok || !data.ok) {
          throw new Error(data.error?.message || "Gagal memuat siswa")
        }
        setRows(data.data || [])
        setPage(1)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat siswa")
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [query])

  const handleCreate = async () => {
    if (!newStudent.nim || !newStudent.nama) {
      setError("NIM dan nama wajib")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error?.message || "Gagal membuat siswa")
      // reload list
      const refreshed = await fetch(`/api/admin/students?limit=100`)
      const rdata = await refreshed.json()
      if (refreshed.ok && rdata.ok) {
        setRows(rdata.data || [])
      }
      setNewStudent({ nim: "", nama: "", status: "active", kelas: "", angkatan: "" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat siswa")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Data master</p>
          <h1 className="text-xl font-semibold text-slate-900">Students</h1>
        </div>
        <Badge variant="outline">Live data</Badge>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Cari siswa</CardTitle>
          <div className="flex items-center gap-2 w-full sm:w-80">
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              placeholder="Cari NIM atau nama..."
              className="pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 -ml-8" />
          </div>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <Input
              placeholder="NIM"
              value={newStudent.nim}
              onChange={(e) => setNewStudent((p) => ({ ...p, nim: e.target.value }))}
            />
            <Input
              placeholder="Nama"
              value={newStudent.nama}
              onChange={(e) => setNewStudent((p) => ({ ...p, nama: e.target.value }))}
            />
            <Input
              placeholder="Kelas"
              value={newStudent.kelas}
              onChange={(e) => setNewStudent((p) => ({ ...p, kelas: e.target.value }))}
            />
            <Input
              placeholder="Angkatan"
              value={newStudent.angkatan}
              onChange={(e) => setNewStudent((p) => ({ ...p, angkatan: e.target.value }))}
            />
            <Select
              value={newStudent.status}
              onValueChange={(v) => setNewStudent((p) => ({ ...p, status: v as StudentStatus }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Menyimpan..." : "Tambah Siswa"}
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Angkatan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin inline-block text-slate-500" />
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-sm text-slate-500">
                    Tidak ada siswa
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((student) => (
                  <TableRow key={student.nim}>
                    <TableCell className="font-medium">{student.nim}</TableCell>
                    <TableCell>{student.nama}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === "active" ? "outline" : "secondary"}>
                        {student.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <UserCheck className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <UserX className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{student.angkatan || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, rows.length)} of {rows.length}
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={() => setPage((p) => Math.max(1, p - 1))} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink href="#" isActive={idx + 1 === page} onClick={() => setPage(idx + 1)}>
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
