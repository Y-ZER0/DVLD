"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, CircleCheck, LoaderCircle } from "lucide-react"
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
import { SearchableCombobox } from "@/shared/components/searchable-combobox"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { ApplicationType, type InternationalEligibleDriverDto } from "@repo/shared"
import { useApplicationTypes } from "@/features/lookup/hooks/use-application-types"
import { useEligibleInternationalDrivers } from "../../hooks/use-eligible-international-drivers"
import { useIssueInternationalLicense } from "../../hooks/use-issue-international-license"

const issueInternationalLicenseSchema = z.object({
  driverId: z.number({ message: "Select a driver" }).int().positive(),
})

type IssueInternationalLicenseFormValues = z.infer<typeof issueInternationalLicenseSchema>

interface IssueInternationalLicenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IssueInternationalLicenseModal({
  open,
  onOpenChange,
}: IssueInternationalLicenseModalProps) {
  const form = useForm<IssueInternationalLicenseFormValues>({
    resolver: zodResolver(issueInternationalLicenseSchema),
    defaultValues: { driverId: undefined },
  })

  const issueInternationalLicense = useIssueInternationalLicense()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const eligibleDrivers = useEligibleInternationalDrivers()
  const applicationTypes = useApplicationTypes()

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  const driverId = form.watch("driverId")
  const selectedDriver =
    eligibleDrivers.data?.find((driver) => driver.driverId === driverId) ?? null

  const internationalFee = applicationTypes.data?.find(
    (type) => type.applicationTypeTitle === ApplicationType.NEW_INTERNATIONAL_LICENSE,
  )?.applicationFees
  const feeText = internationalFee ? `$${internationalFee}` : "—"

  const onSubmit = async (values: IssueInternationalLicenseFormValues) => {
    setSubmitError(null)
    try {
      await issueInternationalLicense.mutateAsync({ driverId: values.driverId })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, "Could not issue the international license. Try again."),
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">
            Issue International License
          </DialogTitle>
          <DialogDescription>
            The system verifies the driver holds an active Ordinary Driving License
            (Class 3) before issuing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            <Controller
              control={form.control}
              name="driverId"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="driver">Driver</Label>
                  <SearchableCombobox<InternationalEligibleDriverDto>
                    id="driver"
                    value={selectedDriver}
                    onValueChange={(driver) =>
                      field.onChange(driver ? driver.driverId : undefined)
                    }
                    options={eligibleDrivers.data}
                    isPending={eligibleDrivers.isPending}
                    isError={eligibleDrivers.isError}
                    onRetry={() => eligibleDrivers.refetch()}
                    getOptionKey={(driver) => driver.driverId}
                    getOptionLabel={(driver) => driver.driverName}
                    getOptionSecondary={(driver) => driver.nationalNumber}
                    triggerPlaceholder="Select a driver..."
                    searchPlaceholder="Search by name or national number"
                    loadingMessage="Loading eligible drivers…"
                    errorMessage="Could not load eligible drivers."
                    emptyMessage="No drivers with an active Car license"
                    noMatchMessage={(search) => `No drivers match "${search}"`}
                    invalid={!!fieldState.error}
                  />
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {driverId && (
              <div className="rounded-lg border border-success/20 bg-success-tint p-4">
                <div className="flex items-center gap-2">
                  <CircleCheck
                    aria-hidden="true"
                    className="size-5 rounded-full bg-success text-success-foreground"
                  />
                  <p className="text-sm font-bold text-success">
                    Verified: active Class 3 (Car) local license on file.
                  </p>
                </div>
                <dl className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Application Fee</dt>
                    <dd className="text-sm font-medium tabular-nums">{feeText}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-muted-foreground">Validity</dt>
                    <dd className="text-sm font-medium">1 year from issue date</dd>
                  </div>
                </dl>
              </div>
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
              type="submit"
              className="h-10"
              disabled={!driverId || issueInternationalLicense.isPending}
            >
              {issueInternationalLicense.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Issuing…
                </>
              ) : (
                <>Issue License · {feeText}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}