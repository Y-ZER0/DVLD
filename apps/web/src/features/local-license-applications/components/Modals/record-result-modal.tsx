"use client"

import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleAlert, LoaderCircle } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import type { TestStageDto } from "@repo/shared"
import { useRecordTestResult } from "../../hooks/use-record-test-result"

// STEP 1: The zod schema is the single client-side validation definition
//         (library-docs.md § 9) — it mirrors the 5.1
//         RecordTestResultRequestDto ('passed' | 'failed' via the select,
//         optional notes capped at the backend's 500) so a malformed
//         submit is rejected here before it hits the API. The definitive
//         gates (lock already set → 409, dead application → 409) are
//         server-side by design (invariants #20/#21); this schema is the
//         friendly pre-check only.
const recordResultSchema = z.object({
  result: z.enum(["passed", "failed"], { message: "Select a result" }),
  notes: z.string().max(500).optional(),
})

type RecordResultFormValues = z.infer<typeof recordResultSchema>

// RecordResultModal — the "Record Test Result" dialog (Feature 5.2,
// descriptive-prompt spec): compact ~480px card, exact lock warning copy
// under the title, Result select + Examiner Notes textarea, and a light
// footer strip with Cancel / "Save & Lock". Saving fires the 5.1 PATCH; a
// server rejection (409 already-locked, 409 dead application) surfaces
// verbatim and keeps the dialog open — never a silent close on failure.
// The "permanently locks" warning is load-bearing copy (ui-registry "Do
// not": every modal's description line states the consequence of the
// action), and mirrors the 5.1 service's irreversible-lock semantics.

interface RecordResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  // The CURRENT stage (status 'Scheduled') whose open booking is being
  // recorded; appointmentId is that booking — never null for a
  // recordable stage, so the button cannot fire without one.
  stage: TestStageDto
}

export function RecordResultModal({
  open,
  onOpenChange,
  applicationId,
  stage,
}: RecordResultModalProps) {
  // STEP 2: RHF owns field state + errors; the resolver wires the schema.
  const form = useForm<RecordResultFormValues>({
    resolver: zodResolver(recordResultSchema),
    defaultValues: { result: undefined, notes: "" },
  })

  const recordResult = useRecordTestResult(applicationId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 3: Modal lifecycle — reset fields and drop any stale server
  //         error every time the dialog (re)opens, so a previous session's
  //         state or a previous failure never leaks into the next one.
  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  // STEP 4: Submit — the verdict maps straight onto the 5.1 vocabulary
  //         ('passed'/'failed'); the empty-notes default is dropped so the
  //         optional field stays absent on the wire. On success the
  //         mutation's invalidations refresh the stepper + history
  //         (invariant #6) and the dialog closes.
  const onSubmit = async (values: RecordResultFormValues) => {
    setSubmitError(null)
    try {
      if (!stage.appointmentId) return
      await recordResult.mutateAsync({
        appointmentId: stage.appointmentId,
        dto: { result: values.result, notes: values.notes || undefined },
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not save the result. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* STEP 5: Centered white card per spec — ~480px max width, rounded
               corners + crisp border + float above the backdrop via the
               Dialog primitive's ring/animation; the X close icon comes
               from the primitive. */}
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          {/* STEP 6: Header — title + the exact lock warning from the
                   spec. The copy IS the gate's front-end face (invariant
                   #20 — permanent, irreversible). */}
          <DialogTitle className="text-lg font-semibold">Record Test Result</DialogTitle>
          <DialogDescription>
            Saving a result permanently locks this appointment. A failed test requires a new
            appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            {/* STEP 7: Result — the Passed/Failed verdict picker. The two
                     legal values are the backend's 'passed' | 'failed'
                     vocabulary (5.1 DTO), rendered as human labels. */}
            <Controller
              control={form.control}
              name="result"
              render={({ field, fieldState }) => (
                <div className="space-y-1.5">
                  <Label htmlFor="result">Result</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="result"
                      className="h-10 w-full bg-card"
                      aria-invalid={!!fieldState.error}
                    >
                      <SelectValue placeholder="Select a result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">Passed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <p className="text-xs font-medium text-destructive" role="alert">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
              )}
            />

            {/* STEP 8: Examiner Notes — free text, explicitly optional;
                     max length mirrors the backend's MaxLength(500). */}
            <div className="space-y-1.5">
              <Label htmlFor="notes">Examiner Notes</Label>
              <Textarea
                id="notes"
                placeholder="Observations, score, remarks..."
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

          {/* STEP 9: Server-side failure (409 already-locked — a raced
                   double-click or a stale screen — or 409 dead
                   application) surfaces in the standard alert box and the
                   dialog stays open. */}
          {submitError && (
            <div
              role="alert"
              className="mx-6 mb-2 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0">{submitError}</span>
            </div>
          )}

          {/* STEP 10: Footer — light gray strip (#F8FAFC = bg-background
                   token, PersonFormModal precedent) with the right-aligned
                   Cancel (white bg, light border) + primary Save & Lock. */}
          <DialogFooter className="gap-3 border-t bg-background px-6 pt-5 pb-6">
            <Button
              type="button"
              variant="outline"
              className="h-10 bg-card"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={recordResult.isPending}>
              {recordResult.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save & Lock"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}