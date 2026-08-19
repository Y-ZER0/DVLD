"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react"
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
import { ApplicationType, type LicenseRegisterRowDto } from "@repo/shared"
import { useApplicationTypes } from "@/features/lookup/hooks/use-application-types"
import { useLicenseClasses } from "@/features/lookup/hooks/use-license-classes"
import { useRenewLicense } from "../../hooks/use-renew-license"

const renewLicenseSchema = z.object({
  notes: z.string().max(500).optional(),
})

type RenewLicenseFormValues = z.infer<typeof renewLicenseSchema>

interface RenewLicenseModalProps {
  license: LicenseRegisterRowDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RenewLicenseModal({
  license,
  open,
  onOpenChange,
}: RenewLicenseModalProps) {
  const form = useForm<RenewLicenseFormValues>({
    resolver: zodResolver(renewLicenseSchema),
    defaultValues: { notes: "" },
  })

  const renewLicense = useRenewLicense(license.id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: applicationTypes } = useApplicationTypes()
  const { data: licenseClasses } = useLicenseClasses()

  const applicationFee = applicationTypes?.find(
    (type) => type.applicationTypeTitle === ApplicationType.RENEW_DRIVING_LICENSE,
  )?.applicationFees
  const classFee = licenseClasses?.find(
    (licenseClass) => licenseClass.id === license.licenseClassId,
  )?.classFees

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const onSubmit = async (values: RenewLicenseFormValues) => {
    setSubmitError(null)
    try {
      await renewLicense.mutateAsync({ notes: values.notes || undefined })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not renew this license. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Renew License</DialogTitle>
          <DialogDescription>
            Renewing the {license.className} license for {license.driverName} deactivates{" "}
            <span className="font-medium text-foreground">LIC-{license.id}</span> and issues
            a new one. Fees: ${applicationFee ?? "—"} application + ${classFee ?? "—"}{" "}
            license.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Renewal of license."
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
            <Button type="submit" className="h-10" disabled={renewLicense.isPending}>
              {renewLicense.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Renewing…
                </>
              ) : (
                <>
                  <RefreshCw aria-hidden="true" />
                  Renew License
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}