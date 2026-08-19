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

// STEP 1: The zod schema is the single client-side validation definition
//         (library-docs.md § 9) — it mirrors the 6.1
//         IssueLicenseRequestDto (optional notes capped at the backend's
//         500) so a malformed submit is rejected here before it hits the
//         API. The definitive gates (pipeline not all-Passed → 409,
//         non-New application → 409, existing active same-class license
//         → 409 — invariants #22/#26) are server-side by design; this
//         schema is the friendly pre-check only.
const issueLicenseSchema = z.object({
  notes: z.string().max(500).optional(),
})

type IssueLicenseFormValues = z.infer<typeof issueLicenseSchema>

// IssueLicenseModal — the "Issue License" confirmation dialog (Feature
// 6.2, descriptive-prompt spec): compact ~480px card, dynamic subtitle
// naming the class, applicant and live fee, Notes textarea, and a light
// footer strip with Cancel / primary "Issue License". Submitting fires
// the 6.1 POST; a server rejection (409 pipeline gate, 409 dead
// application, 409 active same-class license) surfaces verbatim and
// keeps the dialog open — never a silent close on failure. On success
// the issued LicenseDto is lifted to the page, which swaps the CTA for
// the post-issuance banner (ui-registry ConfirmationBanner).

interface IssueLicenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: LocalDrivingLicenseApplicationDto
  // Live ClassFees for the application's class (invariant #28 — the
  // issuance snapshots it at transaction time; the UI never hardcodes
  // or recomputes it). Renders "—" until the lookup resolves.
  licenseFee: string | undefined
  // Called with the issued license so the page can render the success
  // banner from server truth (page state, not a second fetch).
  onIssued: (license: LicenseDto) => void
}

export function IssueLicenseModal({
  open,
  onOpenChange,
  application,
  licenseFee,
  onIssued,
}: IssueLicenseModalProps) {
  // STEP 2: RHF owns field state + errors; the resolver wires the schema.
  const form = useForm<IssueLicenseFormValues>({
    resolver: zodResolver(issueLicenseSchema),
    defaultValues: { notes: "" },
  })

  const issueLicense = useIssueLicense(application.id)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 3: Modal lifecycle — reset the field and drop any stale server
  //         error every time the dialog (re)opens, so a previous
  //         session's state never leaks into the next one.
  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  // STEP 4: Submit — the empty-notes default is dropped so the optional
  //         field stays absent on the wire; on success the mutation's
  //         invalidations refresh the application + register
  //         (invariant #6) and the issued license rides up to the page
  //         for the banner.
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
      {/* STEP 5: Centered white card per spec — ~480px max width, rounded
               corners + crisp border, X close icon from the primitive. */}
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          {/* STEP 6: Header — title + dynamic subtitle carrying the
                   class, applicant, live fee, and the driver-record
                   note (the 6.1 one-transaction behavior, invariant
                   #23, spelled out in the spec's copy). */}
          <DialogTitle className="text-lg font-semibold">Issue License</DialogTitle>
          <DialogDescription>
            Issue a {application.className} license to {application.applicantName}. Fee:{" "}
            {licenseFee ? `$${licenseFee}` : "—"}. If the applicant is not yet a driver, a
            driver record is created automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            {/* STEP 7: Notes — optional free text; the placeholder is
                     the FirstTime issue-reason copy (this feature only
                     issues FirstTime licenses; the 7.x renewal/
                     replacement modals will vary it). Max length mirrors
                     the backend's MaxLength(500). The primary-blue focus
                     ring (#2563EB) IS the shadcn Textarea default (ring
                     token) — nothing custom needed. */}
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

          {/* STEP 8: Server-side failure (409 pipeline gate / dead
                   application / active same-class license — a raced
                   double-click or a stale screen) surfaces in the
                   standard alert box and the dialog stays open. */}
          {submitError && (
            <div
              role="alert"
              className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{submitError}</span>
            </div>
          )}

          {/* STEP 9: Footer — light gray strip (#F8FAFC = bg-background
                   token, FormModal precedent) with right-aligned Cancel
                   (white bg, light border) + primary Issue License with
                   the ribbon/badge icon (Award, ui-registry icon set). */}
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