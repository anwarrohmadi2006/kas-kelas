"use client"

import type React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Shield, Users, CalendarClock, CreditCard, Wallet, Settings, Bell, QrCode, BarChart3 } from "lucide-react"
import { useState } from "react"

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: BarChart3 },
  { label: "Students", href: "/admin/students", icon: Users },
  { label: "Periods", href: "/admin/periods", icon: CalendarClock },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Cash", href: "/admin/cash", icon: Wallet },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Reminders", href: "/admin/reminders", icon: Bell },
  { label: "QRIS", href: "/admin/qris", icon: QrCode },
]

export function AdminShell({ adminEmail, children }: { adminEmail: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
    } catch (error) {
      console.error("Failed to logout", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 border-r bg-white hidden md:flex flex-col">
        <div className="px-6 py-5 border-b flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            K
          </div>
          <div>
            <p className="text-sm text-slate-500">Kas Kelas SDT 2024</p>
            <p className="font-semibold text-slate-900 flex items-center gap-1">
              <Shield className="w-4 h-4 text-indigo-600" /> Admin Panel
            </p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-4">
          <p className="text-xs text-slate-500 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-slate-800">{adminEmail}</p>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? "Signing out..." : "Logout"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Admin</p>
            <h1 className="text-lg font-semibold text-slate-900">Kas Management</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-slate-800">{adminEmail}</span>
              <span className="text-xs text-slate-500">Session cookie (HttpOnly)</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
              {adminEmail.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
