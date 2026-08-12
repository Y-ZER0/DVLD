import type { Metadata } from "next"
import { AuthSplitScreen } from "@/features/auth/components/auth-split-screen"

export const metadata: Metadata = {
  title: "Sign in — DVLD",
}

// / — login: thin page: composition only, no hooks/state (invariant #12).
// The split-screen layout is hidden behind this route; success redirects
// to the protected /dashboard landing (0.B.2).
export default function HomePage() {
  return <AuthSplitScreen />
}