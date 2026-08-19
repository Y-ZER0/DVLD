"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, FileWarning, FileX, LoaderCircle } from "lucide-react"
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
import { useReplaceLicense } from "../../hooks/use-replace-license"

const replaceLicenseSchema = z.object({
  notes: z.string().max(500).optional(),
})

type ReplaceLicenseFormValues = z.infer<typeof replaceLicenseSchema>

const REPLACE_META: Record<
  "damaged" | "lost",
  {
    applicationType: ApplicationType
    title: string
    description: string
    notesPlaceholder: string
    actionLabel: string
  }
> = {
  damaged: {
    applicationType: ApplicationType.REPLACEMENT_FOR_DAMAGED_LICENSE,
    title: "Replace Damaged License",
    description: "Replacing the damaged",
    notesPlaceholder: "Replacement for damaged license.",
    actionLabel: "Replace License",
  },
  lost: {
    applicationType: ApplicationType.REPLACEMENT_FOR_LOST_LICENSE,
    title: "Replace Lost License",
    description: "Replacing the lost",
    notesPlaceholder: "Replacement for lost license.",
    actionLabel: "Replace License",
  },
}

interface ReplaceLicenseModalProps {
  license: LicenseRegisterRowDto
  reason: "damaged" | "lost"
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReplaceLicenseModal({
  license,
  reason,
  open,
  onOpenChange,
}: ReplaceLicenseModalProps) {
  const form = useForm<ReplaceLicenseFormValues>({
    resolver: zodResolver(replaceLicenseSchema),
    defaultValues: { notes: "" },
  })

  const replaceLicense = useReplaceLicense(license.id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data: applicationTypes } = useApplicationTypes()
  const { data: licenseClasses } = useLicenseClasses()

  const applicationFee = applicationTypes?.find(
    (type) => type.applicationTypeTitle === REPLACE_META[reason].applicationType,
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

  const onSubmit = async (values: ReplaceLicenseFormValues) => {
    setSubmitError(null)
    try {
      await replaceLicense.mutateAsync({
        reason,
        notes: values.notes || undefined,
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not replace this license. Try again."))
    }
  }

  const meta = REPLACE_META[reason]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">{meta.title}</DialogTitle>
          <DialogDescription>
            {meta.description} {license.className} license for {license.driverName}{" "}
            deactivates{" "}
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
                placeholder={meta.notesPlaceholder}
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
            <Button type="submit" className="h-10" disabled={replaceLicense.isPending}>
              {replaceLicense.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Replacing…
                </>
              ) : (
                <>
                  {reason === "damaged" ? (
                    <FileWarning aria-hidden="true" />
                  ) : (
                    <FileX aria-hidden="true" />
                  )}
                  {meta.actionLabel}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}