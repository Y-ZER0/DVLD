"use client"

import { useState } from "react"
import { LoaderCircle, XCircle } from "lucide-react"
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
import type { LocalDrivingLicenseApplicationDto } from "@repo/shared"
import { useCancelApplication } from "../../hooks/use-cancel-application"

// CancelApplicationDialog — confirmation step for cancelling a New
// application (ui-rules.md: destructive actions ALWAYS confirm, never fire
// on a single click). Names the application ("L-<App No.>") so a clerk
// verifies what they are cancelling; cancellation is a one-way door (only
// New → Cancelled, server-enforced — 409 on a non-New application
// surfaces verbatim here and keeps the dialog open, the same 409
// stay-open pattern as DeleteUserDialog).

interface CancelApplicationDialogProps {
  application: LocalDrivingLicenseApplicationDto
  onOpenChange: (open: boolean) => void
}

export function CancelApplicationDialog({
  application,
  onOpenChange,
}: CancelApplicationDialogProps) {
  const cancelApplication = useCancelApplication()
  const [error, setError] = useState<string | null>(null)

  // STEP 1: Submit the cancel only on explicit confirmation; a server
  //         rejection (409: already Cancelled/Completed — the one-way
  //         door) must explain itself and keep the dialog open rather
  //         than silently closing.
  const handleConfirm = async () => {
    setError(null)
    try {
      await cancelApplication.mutateAsync(application.id)
      onOpenChange(false)
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not cancel this application. Try again."))
    }
  }

  return (
    <AlertDialog open={true} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Cancel application L-{application.applicationId}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The application for{" "}
            <span className="font-medium text-foreground">{application.applicantName}</span>{" "}
            — {application.className} — will be marked as{" "}
            <span className="font-medium text-foreground">Cancelled</span>. This action
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
          <AlertDialogCancel className="h-10 bg-card">Keep Application</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 bg-destructive text-destructive-foreground hover:bg-destructive/80"
            disabled={cancelApplication.isPending}
            onClick={(e) => {
              // STEP 2: AlertDialogAction closes on click by default — we
              //         must prevent that so the dialog stays open when the
              //         server rejects (409) and only closes on success.
              e.preventDefault()
              void handleConfirm()
            }}
          >
            {cancelApplication.isPending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Cancelling…
              </>
            ) : (
              <>
                <XCircle aria-hidden="true" />
                Cancel Application
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}