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

interface DeleteUserDialogProps {
  user: UserDto | null
  onOpenChange: (open: boolean) => void
}

export function DeleteUserDialog({ user, onOpenChange }: DeleteUserDialogProps) {
  const deleteUser = useDeleteUser()
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!user) return
    setError(null)
    try {
      await deleteUser.mutateAsync(user.id)
      onOpenChange(false)
    } catch (err) {
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