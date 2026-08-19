import type { Metadata } from "next"
import { AuthSplitScreen } from "@/features/auth/components/auth-split-screen"

export const metadata: Metadata = {
  title: "Sign in — DVLD",
}

export default function HomePage() {
  return <AuthSplitScreen />
}