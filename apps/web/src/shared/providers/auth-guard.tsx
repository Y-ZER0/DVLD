"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useAuthStore } from "../stores/auth.store"

export function AuthGuard({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token)
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && !token) {
      router.replace("/")
    }
  }, [hasHydrated, token, router])

  if (!hasHydrated || !token) {
    return null
  }

  return <>{children}</>
}