"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuthStore } from "@/shared/stores/auth.store"

export default function AuthLandingPage() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

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