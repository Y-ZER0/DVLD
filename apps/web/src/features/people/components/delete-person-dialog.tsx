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
import type { PersonDto } from "@repo/shared"
import { useDeletePerson } from "../hooks/use-delete-person"

// DeletePersonDialog — confirmation step for removing a citizen
// (ui-rules.md: destructive actions ALWAYS confirm, never fire on a single
// click). Shows the target's identity so a clerk verifies who they are
// deleting; the server's 409 "linked records exist" surfaces verbatim on
// the dialog so the blocked deletion explains itself.

interface DeletePersonDialogProps {
  person: PersonDto | null
  onOpenChange: (open: boolean) => void
}

export function DeletePersonDialog({ person, onOpenChange }: DeletePersonDialogProps) {
  const deletePerson = useDeletePerson()
  const [error, setError] = useState<string | null>(null)

  // STEP 1: Close always wins over stale state — no person prop means the
  //         dialog is hidden (the caller unmounts the row state on close).
  const handleConfirm = async () => {
    if (!person) return
    setError(null)
    try {
      await deletePerson.mutateAsync(person.id)
      onOpenChange(false)
    } catch (err) {
      // STEP 2: A 409 (linked Users/Drivers records exist) must explain
      //         itself — show the server's message instead of a generic
      //         failure. The row stays and the clerk can retry later.
      setError(getApiErrorMessage(err, "Could not delete this person. Try again."))
    }
  }

  return (
    <AlertDialog
      open={person !== null}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete person?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="font-medium text-foreground">
              {person ? `${person.firstName} ${person.lastName}` : "this citizen"}
            </span>{" "}
            ({person?.nationalNumber ?? "—"}) from the national registry. This action
            cannot be undone.
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
            disabled={deletePerson.isPending}
            onClick={(e) => {
              // STEP 3: AlertDialogAction closes on click by default — we
              //         must prevent that so the dialog stays open when the
              //         server rejects (409) and only closes on success.
              e.preventDefault()
              void handleConfirm()
            }}
          >
            {deletePerson.isPending ? (
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