import type { ReactNode } from "react"
import { AuthGuard } from "@/shared/providers/auth-guard"
import { AppShell } from "@/shared/components/app-shell/app-shell"

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}