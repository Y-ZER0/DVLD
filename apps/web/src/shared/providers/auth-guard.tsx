"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useAuthStore } from "../stores/auth.store"

// AuthGuard — the client-side gate for the (protected) route group
// (build-plan 0.B.2). It blocks rendering until the persisted session has
// been rehydrated, then either shows the protected children or redirects
// to /. This is UX enforcement only — the API's global JwtAuthGuard
// is the actual security boundary (architecture.md invariant #31); a client
// guard can be bypassed, an APP_GUARD cannot.

export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const router = useRouter()

  // STEP 1: After hydration completes, an unauthenticated visitor is
  //         redirected to the login screen (/). Wait for hasHydrated first —
  //         during the first render the store is still empty even for a
  //         returning user with a valid stored session.
  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/")
    }
  }, [hasHydrated, token, router])

  // STEP 2: Render nothing until we know the session state. Returning a
  //         guard frame or children prematurely would flash protected
  //         content (or an empty frame) on every route change.
  if (!hasHydrated || !token) {
    return null
  }

  // STEP 3: Authenticated and hydrated — render the protected tree.
  return <>{children}</>
}