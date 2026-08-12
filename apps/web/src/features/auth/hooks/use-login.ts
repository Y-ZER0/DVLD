"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/shared/stores/auth.store"
import { authService } from "../services/auth.service"
import type { LoginRequestDto } from "@repo/shared"

// useLogin — orchestrates the sign-in submit: calls the service, lands the
// returned session in the Zustand store (client state — invariant #1), and
// navigates to the protected landing page. Holds only transient UI state
// (pending / error) for the form; the session itself never lives here.

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // STEP 1: The component calls this from the form's onSubmit. Clear any
  //         previous error first so a retry never shows a stale message.
  const login = async (dto: LoginRequestDto) => {
    setIsPending(true)
    setError(null)
    try {
      // STEP 2: The actual HTTP call is the service's job — hooks never
      //         touch apiClient directly (invariant #4).
      const auth = await authService.login(dto)

      // STEP 3: Success lands the session in the persist store, then we
      //         replace to the protected dashboard (/dashboard) so a
      //         back-button press can't return into the form with a token
      //         already set.
      setAuth(auth)
      router.replace("/dashboard")
    } catch {
      // STEP 4: A rejected login (401) is shown inline on the form — the
      //         apiClient interceptor deliberately lets login 401s through
      //         without redirecting (see api-client.ts). Any other failure
      //         surfaces the same generic message; credentials are never
      //         echoed back.
      setError("Invalid username or password.")
    } finally {
      setIsPending(false)
    }
  }

  return { login, isPending, error }
}