"use client"

import { useState } from "react"
import { LoaderCircle, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import type { UserDto } from "@repo/shared"
import { useDeleteUser } from "../hooks/use-delete-user"

// DeleteUserDialog — confirmation step for removing a login account
// (ui-rules.md: destructive actions ALWAYS confirm, never fire on a single
// click). Shows the account's username so a clerk verifies what they are
// deleting; the server's 409 (account referenced by applications/drivers)
// surfaces verbatim on the dialog — it stays open rather than closing, so
// the blocked deletion explains itself (same 409 stay-open pattern as
// DeletePersonDialog).

interface DeleteUserDialogProps {
  user: UserDto | null
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ user, onOpenChange }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser()
  const [error, setError] = useState<string | null>(null)

  // STEP 1: Close always wins over stale state — no user prop means the
  //         dialog is hidden (the caller unmounts the row state on close).
  const handleConfirm = async () => {
    if (!user) return
    setError(null)
    try {
      await deleteUser.mutateAsync(user.id)
      onOpenChange(false)
    } catch (err) {
      // STEP 2: A 409 (linked records exist) must explain itself — show
      //         the server's message instead of a generic failure. The
      //         row stays and the clerk can deactivate via the toggle
      //         instead.
      setError(getApiErrorMessage(err, "Could not delete this account. Try again."))
    }
  }

  return (
    <AlertDialog
      open={user !== null}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user account?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the account{" "}
            <span className="font-medium text-foreground">{user?.username ?? "—"}</span>{" "}
            linked to <span className="font-medium text-foreground">{user?.personName ?? "—"}</span>.
            The citizen record itself is not deleted. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel className="h-10 bg-card">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 bg-destructive text-destructive-foreground hover:bg-destructive/80"
            disabled={deleteUser.isPending}
            onClick={(e) => {
              // STEP 3: AlertDialogAction closes on click by default — we
              //         must prevent that so the dialog stays open when the
              //         server rejects (409) and only closes on success.
              e.preventDefault()
              void handleConfirm()
            }}
          >
            {deleteUser.isPending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 aria-hidden="true" />
                Delete
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}