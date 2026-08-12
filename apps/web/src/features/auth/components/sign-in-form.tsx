"use client"

import { useState } from "react"
import { CircleAlert, LoaderCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLogin } from "../hooks/use-login"
import { PasswordInput } from "./password-input"

// SignInForm — the right-hand functional panel of the login screen
// (build-plan 0.B.2): Username + Password fields, a full-width primary
// Sign in button, and an inline error readout. The session produced here
// flows through useLogin → authService → useAuthStore.

export function SignInForm() {
  const { login, isPending, error } = useLogin()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  // STEP 1: Submit starts only when the browser's built-in required
  //         validation passes (both fields non-empty), then delegates to
  //         the hook. The button stays disabled while a request flies so a
  //         double-click can't fire two logins.
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void login({ username: username.trim(), password })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm" noValidate={false}>
      {/* STEP 2: Heading + one-line muted subtext per ui-registry. */}
      <h2 className="text-2xl font-bold">Sign in</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use your departmental credentials to access the console.
      </p>

      {/* STEP 3: Inline error, announced politely; only appears after a
          failed attempt (bad credentials or an unreachable API). */}
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* STEP 4: Username — labelled input with a user icon on the left
          and the light-grey 'admin' placeholder (per the descriptive
          prompt), autoComplete="username" for password managers. */}
      <div className="mt-6 space-y-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="admin"
            className="h-10 pl-9"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      {/* STEP 5: Password field — lock icon left, dots, eye toggle right
          (PasswordInput), autoComplete="current-password". */}
      <div className="mt-4 space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* STEP 6: Full-width primary action; spinner while pending. */}
      <Button type="submit" className="mt-6 h-10 w-full" disabled={isPending}>
        {isPending ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}