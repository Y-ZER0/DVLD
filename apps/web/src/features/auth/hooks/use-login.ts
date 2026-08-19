"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/shared/stores/auth.store"
import { authService } from "../services/auth.service"
import type { LoginRequestDto } from "@repo/shared"

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (dto: LoginRequestDto) => {
    setIsPending(true)
    setError(null)
    try {
      const auth = await authService.login(dto)

      setAuth(auth)
      router.replace("/dashboard")
    } catch {
      setError("Invalid username or password.")
    } finally {
      setIsPending(false)
    }
  }

  return { login, isPending, error }
}