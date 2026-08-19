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

const scheduleAppointmentSchema = z.object({
  appointmentDate: z.string().min(1, "Choose an appointment date"),
})

type ScheduleAppointmentFormValues = z.infer<typeof scheduleAppointmentSchema>

interface ScheduleAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  stage: TestStageDto
}

export function ScheduleAppointmentModal({
  open,
  onOpenChange,
  applicationId,
  stage,
}: ScheduleAppointmentModalProps) {
  const form = useForm<ScheduleAppointmentFormValues>({
    resolver: zodResolver(scheduleAppointmentSchema),
    defaultValues: { appointmentDate: "" },
  })

  const scheduleAppointment = useScheduleTestAppointment(applicationId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const testTypes = useTestTypes()
  const stageFee = testTypes.data?.find((type) => type.id === stage.testTypeId)?.testTypeFees
  const feeText = stageFee ? `Booking fee: $${stageFee}.` : "Booking fee: —."

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

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
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Schedule Test Appointment</DialogTitle>
          <DialogDescription>
            {stage.title} · {stage.description} — {feeText}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
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