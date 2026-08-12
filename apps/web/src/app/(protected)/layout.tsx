import type { ReactNode } from "react"
import { AuthGuard } from "@/shared/providers/auth-guard"
import { AppShell } from "@/shared/components/app-shell/app-shell"

// (protected) route group layout — every route inside this group sits
// behind AuthGuard (unauth → /) and renders inside the AppShell frame
// (sidebar + topbar + content slot, feature 0.C.1).
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  )
}