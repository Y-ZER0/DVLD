"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthDto, AuthUserDto } from "@repo/shared"

interface AuthState {
  token: string | null
  user: AuthUserDto | null
  hasHydrated: boolean
  setAuth: (auth: AuthDto) => void
  clearAuth: () => void
  markHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,

      setAuth: (auth) => set({ token: auth.token, user: auth.user }),

      clearAuth: () => set({ token: null, user: null }),

      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "dvld-auth-session",
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
    },
  ),
)