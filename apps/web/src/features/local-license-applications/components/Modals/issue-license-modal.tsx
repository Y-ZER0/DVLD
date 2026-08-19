"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Award, CircleAlert, LoaderCircle } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import type { LicenseDto, LocalDrivingLicenseApplicationDto } from "@repo/shared"
import { useIssueLicense } from "../../hooks/use-issue-license"

const issueLicenseSchema = z.object({
  notes: z.string().max(500).optional(),
})

type IssueLicenseFormValues = z.infer<typeof issueLicenseSchema>

interface IssueLicenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: LocalDrivingLicenseApplicationDto
  licenseFee: string | undefined
  onIssued: (license: LicenseDto) => void
}

export function IssueLicenseModal({
  open,
  onOpenChange,
  application,
  licenseFee,
  onIssued,
}: IssueLicenseModalProps) {
  const form = useForm<IssueLicenseFormValues>({
    resolver: zodResolver(issueLicenseSchema),
    defaultValues: { notes: "" },
  })

  const issueLicense = useIssueLicense(application.id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const onSubmit = async (values: IssueLicenseFormValues) => {
    setSubmitError(null)
    try {
      const license = await issueLicense.mutateAsync({ notes: values.notes || undefined })
      onIssued(license)
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not issue the license. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Issue License</DialogTitle>
          <DialogDescription>
            Issue a {application.className} license to {application.applicantName}. Fee:{" "}
            {licenseFee ? `$${licenseFee}` : "—"}. If the applicant is not yet a driver, a
            driver record is created automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="First time issuance."
                className="min-h-24 bg-card"
                aria-invalid={!!form.formState.errors.notes}
                {...form.register("notes")}
              />
              {form.formState.errors.notes && (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {form.formState.errors.notes.message}
                </p>
              )}
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
            <Button type="submit" className="h-10" disabled={issueLicense.isPending}>
              {issueLicense.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Issuing…
                </>
              ) : (
                <>
                  <Award aria-hidden="true" />
                  Issue License
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}