"use client"

import { useState, type ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

// QueryProvider — mounts the app-wide TanStack Query client (invariant #1:
// ALL server state lives in TanStack Query; the only things in Zustand are
// the auth session and UI chrome — library-docs.md § 5). Sits at the root
// layout so every route — login and protected alike — can useQuery.

export function QueryProvider({ children }: { children: ReactNode }) {
  // STEP 1: Create the client once per mount via lazy useState — NOT a
  //         module-level singleton — so dev hot-reloads and tests never
  //         share one long-lived cache across unrelated sessions.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // STEP 2: Transactional data defaults to 30s stale
            //         (library-docs.md § 4). Features whose data changes
            //         rarely (registry lists, lookups) override this in
            //         their own hook.
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}