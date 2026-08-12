"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/shared/stores/auth.store"

// /dashboard — temporary protected landing (0.B.2): exercises the full
// login roundtrip (login → store → guard → AppShell frame). Nothing here
// is final product UI — feature 12.2 replaces it with the real overview.
// The shell now owns the page frame, so this page only centers its card
// inside the shell's content slot.

export default function AuthLandingPage() {
  // STEP 1: Selectors only (invariant #3) — read the session user for the
  //         heading, and clearAuth for the sign-out action.
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  // STEP 2: Sign-out is a client-state action — clearAuth wipes the store
  //         (persist re-writes it as empty), then the (protected) layout's
  //         AuthGuard sees token === null and redirects to /.
  const handleSignOut = () => {
    clearAuth()
  }

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">
            Signed in as {user?.username ?? "…"}
          </CardTitle>
          <CardDescription>
            {user ? `${user.fullName} · Person #${user.personId}` : "Loading session…"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            The protected area is working — the application shell (sidebar,
            topbar) is live (feature 0.C); the real dashboard overview lands
            with feature 12.
          </p>
          <Button variant="outline" className="self-start" onClick={handleSignOut}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}