"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CalendarIcon, CircleAlert, LoaderCircle } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { useTestTypes } from "@/features/lookup/hooks/use-test-types"
import type { TestStageDto } from "@repo/shared"
import { useScheduleTestAppointment } from "../../hooks/use-schedule-test-appointment"

// STEP 1: The zod schema is the single client-side validation definition
//         (library-docs.md § 9) — it mirrors the 5.1
//         ScheduleTestAppointmentRequestDto: the only client-supplied
//         fields are testTypeId (fixed — the stage being booked) and
//         appointmentDate, a required ISO date string from the native
//         date input. The sequencing gates (predecessor must have Passed,
//         invariant #19; one open slot per stage; New-status only) are
//         server-side; this schema is the friendly pre-check only.
const scheduleAppointmentSchema = z.object({
  appointmentDate: z.string().min(1, "Choose an appointment date"),
})

type ScheduleAppointmentFormValues = z.infer<typeof scheduleAppointmentSchema>

// ScheduleAppointmentModal — the "Schedule Test Appointment" dialog
// (Feature 5.2, build-plan spec: date field + fee notice). Same chrome as
// every FormModal (record-result modal template): compact card, title +
// description line, one field, light footer strip with Cancel / primary.
// The description carries the LIVE booking fee for this stage's test type,
// read from the lookup register (invariant #28: never a hardcoded fee,
// never a stale snapshot — the backend re-snapshots at booking time
// regardless). A server rejection (409 double-booking, 409 predecessor
// gate, 409 dead application) surfaces verbatim and keeps the dialog open.

interface ScheduleAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  // The CURRENT stage (status 'Schedule') being booked; testTypeId is the
  // stage's test type, which the 5.1 POST requires in the body.
  stage: TestStageDto
}

export function ScheduleAppointmentModal({
  open,
  onOpenChange,
  applicationId,
  stage,
}: ScheduleAppointmentModalProps) {
  // STEP 2: RHF owns field state + errors; the resolver wires the schema.
  const form = useForm<ScheduleAppointmentFormValues>({
    resolver: zodResolver(scheduleAppointmentSchema),
    defaultValues: { appointmentDate: "" },
  })

  const scheduleAppointment = useScheduleTestAppointment(applicationId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // STEP 3: Fee notice — the TestTypes.TestTypeFees for THIS stage's test
  //         type, read live from the lookup register (5-minute staleTime,
  //         invariant #28). Pending lookups degrade to an em-dash instead
  //         of blocking the booking UI.
  const testTypes = useTestTypes()
  const stageFee = testTypes.data?.find((type) => type.id === stage.testTypeId)?.testTypeFees
  const feeText = stageFee ? `Booking fee: $${stageFee}.` : "Booking fee: —."

  // STEP 4: Modal lifecycle — reset the date and drop any stale server
  //         error every time the dialog (re)opens.
  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

  // STEP 5: Submit — the date maps straight onto the 5.1 DTO alongside
  //         the stage's fixed testTypeId. On success the mutation's
  //         invalidations refresh the stepper (Schedule → Scheduled,
  //         invariant #6) and the dialog closes.
  const onSubmit = async (values: ScheduleAppointmentFormValues) => {
    setSubmitError(null)
    try {
      await scheduleAppointment.mutateAsync({
        testTypeId: stage.testTypeId,
        appointmentDate: values.appointmentDate,
      })
      onOpenChange(false)
      form.reset()
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Could not schedule the appointment. Try again."))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* STEP 6: Centered white card per spec — ~480px max width, rounded
               corners + crisp border + float via the Dialog primitive. */}
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          {/* STEP 7: Header — title + the description line carries the
                   live fee notice (invariant #28) and names the stage
                   being booked. */}
          <DialogTitle className="text-lg font-semibold">Schedule Test Appointment</DialogTitle>
          <DialogDescription>
            {stage.title} · {stage.description} — {feeText}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
            {/* STEP 8: Appointment Date — a native date input, the exact
                     library-docs DOB treatment (person-form-fields.tsx):
                     the hidden picker indicator is stretched across the
                     whole field (absolute inset-0) so a click ANYWHERE
                     opens the browser calendar in Chromium, and
                     showPicker() covers Firefox/Safari. The single
                     CalendarIcon replaces the indicator visually. The
                     value is the required ISO date string the backend's
                     IsDateString validates. */}
            <div className="space-y-1.5">
              <Label htmlFor="appointmentDate">Appointment Date</Label>
              <div className="relative">
                <Input
                  id="appointmentDate"
                  type="date"
                  className="h-10 cursor-pointer bg-card pr-9 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-auto [&::-webkit-calendar-picker-indicator]:w-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                  aria-invalid={!!form.formState.errors.appointmentDate}
                  {...form.register("appointmentDate")}
                  onClick={(event) => event.currentTarget.showPicker?.()}
                />
                <CalendarIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
              </div>
              {form.formState.errors.appointmentDate && (
                <p className="text-xs font-medium text-destructive" role="alert">
                  {form.formState.errors.appointmentDate.message}
                </p>
              )}
            </div>
          </div>

          {/* STEP 9: Server-side failure (409 double-booking, 409
                   predecessor gate — invariant #19, 409 dead application)
                   surfaces in the standard alert box and the dialog stays
                   open. */}
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
                   token) with the right-aligned Cancel + primary Schedule. */}
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
              disabled={scheduleAppointment.isPending}
            >
              {scheduleAppointment.isPending ? (
                <>
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                  Scheduling…
                </>
              ) : (
                "Schedule Appointment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}