"use client"

import { useState } from "react"
import { CircleAlert, LoaderCircle, Unlock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { ApplicationType, type DetentionRegisterRowDto } from "@repo/shared"
import { useApplicationTypes } from "@/features/lookup/hooks/use-application-types"
import { useReleaseLicense } from "../../hooks/use-release-license"

export function ReleaseDetentionModal({
  detention,
  open,
  onOpenChange,
}: {
  detention: DetentionRegisterRowDto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const releaseLicense = useReleaseLicense()
  const applicationTypes = useApplicationTypes()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const releaseFee = applicationTypes.data?.find(
    (type) => type.applicationTypeTitle === ApplicationType.RELEASE_DETAINED_LICENSE,
  )?.applicationFees
  const releaseFeeText = releaseFee ? `$${releaseFee}` : "—"

  const onConfirm = async () => {
    setSubmitError(null)
    try {
      await releaseLicense.mutateAsync(detention.id)
      onOpenChange(false)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not release the license. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Release Detained License</DialogTitle>
          <DialogDescription>
            Clears the detention and collects the fine plus the release application fee.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 py-4">
          <div className="rounded-lg border border-border p-4">
            <dl className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">License</dt>
                <dd className="font-mono text-sm font-semibold">LIC-{detention.licenseId}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Driver</dt>
                <dd className="truncate text-sm font-semibold" title={detention.driverName}>
                  {detention.driverName}
                </dd>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Fine</dt>
                <dd className="text-sm tabular-nums">${detention.fineFees}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Release application fee</dt>
                <dd className="text-sm tabular-nums">{releaseFeeText}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm font-medium">Total due</dt>
                <dd className="text-sm font-bold tabular-nums">${detention.totalDue}</dd>
              </div>
            </dl>
          </div>
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

        <DialogFooter className="gap-3 border-t bg-background px-6 pt-5 pb-6">
          <Button
            type="button"
            variant="outline"
            className="h-10 bg-card"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10"
            disabled={releaseLicense.isPending}
            onClick={onConfirm}
          >
            {releaseLicense.isPending ? (
              <>
                <LoaderCircle className="animate-spin" aria-hidden="true" />
                Releasing…
              </>
            ) : (
              <>
                <Unlock aria-hidden="true" />
                Confirm Release · ${detention.totalDue}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}