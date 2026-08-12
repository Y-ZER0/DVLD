"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// PasswordInput — masked password field with a lock icon on the left and a
// show/hide toggle on the right (ui-registry.md § PasswordInput). The mask
// is pure presentation: toggling to "text" only changes the input type,
// the value is never logged or exposed anywhere else.

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("relative", className)}>
      {/* STEP 1: Lock icon pinned to the left edge, pointer-events-none so
          clicks pass through to the input underneath. */}
      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {/* STEP 2: type="password" masks the value with dots; type="text"
          reveals it only while the toggle is on. */}
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className="h-10 pl-9 pr-12"
        {...props}
      />
      {/* STEP 3: Icon-only toggle — 40x40 hit target (ui-rules.md) via
          size-10, aria-label for screen readers, type="button" so it never
          submits the form. */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 size-10 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
})

export { PasswordInput }