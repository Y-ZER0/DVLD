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