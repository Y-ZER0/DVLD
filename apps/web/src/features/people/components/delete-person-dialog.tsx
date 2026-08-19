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

interface DeletePersonDialogProps {
  person: PersonDto | null
  onOpenChange: (open: boolean) => void
}

export function DeletePersonDialog({ person, onOpenChange }: DeletePersonDialogProps) {
  const deletePerson = useDeletePerson()
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (!person) return
    setError(null)
    try {
      await deletePerson.mutateAsync(person.id)
      onOpenChange(false)
    } catch (err) {
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