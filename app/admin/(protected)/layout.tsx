import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminShell } from "../../../components/AdminShell"
import { verifySessionToken } from "../../../lib/adminSession"

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get("admin_session")?.value
  const session = token ? verifySessionToken(token) : null

  if (!session) {
    redirect("/admin/login")
  }

  return <AdminShell adminEmail={session.email}>{children}</AdminShell>
}
