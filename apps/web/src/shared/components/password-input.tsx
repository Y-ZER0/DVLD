"use client"

import { forwardRef, useState } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PasswordInput = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className="h-10 pl-9 pr-12"
        {...props}
      />
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