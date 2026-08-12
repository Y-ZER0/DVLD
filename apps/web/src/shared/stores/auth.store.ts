"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthDto, AuthUserDto } from "@repo/shared"

// The client-side session store (architecture.md § Authentication & Core
// Patterns, library-docs.md § 5). This is CLIENT state — the token + user
// entered via login — so it belongs in Zustand with persist (survives
// refresh), never in TanStack Query (invariant #1). Everything that needs
// the session (apiClient, AuthGuard, future TopBar) reads it from here;
// nothing touches localStorage directly (library-docs.md § 6).

interface AuthState {
  token: string | null
  user: AuthUserDto | null
  // Set once persist has rehydrated the stored session from localStorage.
  // AuthGuard waits on this so it never redirects a freshly-loaded
  // authenticated visitor to / before hydration completes.
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

      // STEP 1: Login success lands the whole session in one write — token
      //         and user always update together so no state can exist with
      //         a token but no user (or vice versa).
      setAuth: (auth) => set({ token: auth.token, user: auth.user }),

      // STEP 2: 401 handling and manual sign-out both clear the session;
      //         users without a token behave exactly like logged-out ones.
      clearAuth: () => set({ token: null, user: null }),

      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "dvld-auth-session",
      // STEP 3: Only the session itself is persisted — the hydration
      //         flag is runtime-only and must re-run on every load.
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // STEP 4: Storage hydration is async; flip the flag the moment it
        //         finishes so guards stop blocking on the next render.
        state?.markHydrated()
      },
    },
  ),
)