"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, LoaderCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/shared/components/password-input"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import type { UserDto } from "@repo/shared"
import { useUpdateUserPassword } from "../hooks/use-update-user-password"

// STEP 1: The zod schema mirrors the backend UpdateUserPasswordRequestDto
//         (2.1): one new password, 8-72 chars, no old-password step — the
//         clerk acts on the account holder's behalf.
const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
})

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>

// UpdatePasswordModal — the compact "Update Password" dialog (spec 2.2,
// FormModal pattern): maximized ~420px card, title + dynamic subtitle
// ("Set a new password for <username>."), single New Password field, and
// the light footer strip with Cancel / Update Password.

interface UpdatePasswordModalProps {
  user: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdatePasswordModal({ user, open, onOpenChange }: UpdatePasswordModalProps) {
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "" },
  })

  const updatePassword = useUpdateUserPassword()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 2: The modal stays mounted while closed, so values would
  //         otherwise linger between opens — reset the password field and
  //         drop any stale server error every time it opens.
  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  // STEP 3: Submit sends only the new password; a server rejection (e.g.
  //         404 — account deleted meanwhile) is shown inline. On success
  //         the list needs no refresh (no displayed field changed), so no
  //         invalidation happens here — useUpdateUserPassword keeps the
  //         detail cache honest via its own onSuccess.
  const onSubmit = async (values: UpdatePasswordFormValues) => {
    setSubmitError(null)
    try {
      await updatePassword.mutateAsync({ id: user.id, dto: values })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Could not update the password. Try again."),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Update Password</DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium text-foreground">{user.username}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-1.5 px-6 py-4">
            <Label htmlFor="newPassword">New Password</Label>
            <PasswordInput
              id="newPassword"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs font-medium text-destructive" role="alert">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{submitError}</span>
            </div>
          )}

          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 bg-card"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={updatePassword.isPending}>
              {updatePassword.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Updating…
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}