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

const recordResultSchema = z.object({
  result: z.enum(["passed", "failed"], { message: "Select a result" }),
  notes: z.string().max(500).optional(),
})

type RecordResultFormValues = z.infer<typeof recordResultSchema>

interface RecordResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  applicationId: number
  stage: TestStageDto
}

export function RecordResultModal({
  open,
  onOpenChange,
  applicationId,
  stage,
}: RecordResultModalProps) {
  const form = useForm<RecordResultFormValues>({
    resolver: zodResolver(recordResultSchema),
    defaultValues: { result: undefined, notes: "" },
  })

  const recordResult = useRecordTestResult(applicationId)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      form.reset()
      setSubmitError(null)
    }
  }, [open, form])

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
      <DialogContent className="max-w-[480px] gap-0 overflow-hidden rounded-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-1">
          <DialogTitle className="text-lg font-semibold">Record Test Result</DialogTitle>
          <DialogDescription>
            Saving a result permanently locks this appointment. A failed test requires a new
            appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="space-y-4 px-6 py-4">
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