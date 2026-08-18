"use client"

import { Calendar, CircleCheck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TestPipelineDto, TestStageDto } from "@repo/shared"

// Display helpers — the fee arrives as a decimal string ("10.00"),
// display-only client-side (invariant #28); dates are ISO strings
// rendered in the user's locale.
function formatFee(paidFees: string): string {
  return `$${paidFees}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

// TestPipelineCard — the "Test Pipeline" section of the application detail
// page's right-hand card (Feature 5.2, descriptive-prompt spec): exactly
// three vertical stage cards in Vision → Written → Street order, each in
// one of the FOUR pipeline states (Session 14 contract — there is no
// Failed/Pending state on stages):
//   Passed    — soft green card, circular green check, dark-green name +
//               fee description, soft green "Passed" pill
//   Scheduled — white card, dark numbered circle, amber "Scheduled <date>"
//               pill + primary "Record Result" button (this stage is
//               current WITH an open booking)
//   Schedule  — white card, dark numbered circle, "· N failed attempt(s)"
//               when the stage has failed before, outline "Schedule"
//               button with calendar icon (current stage, no booking)
//   Locked    — muted gray card, light gray numbered circle, muted text,
//               gray "Locked" pill with lock icon (beyond the current
//               stage — invariant #19: unreachable until the predecessor
//               Passes)
// The stage data (status, dates, fees, attempt counts) is entirely
// server-derived via GET /test-appointments/pipeline/:id; this component
// renders it, it never computes state (invariant #9).
export function TestPipelineCard({
  pipeline,
  canAct,
  onSchedule,
  onRecordResult,
}: {
  pipeline: TestPipelineDto
  // False for a Cancelled/Completed application — the 5.1 service 409s
  // every test write on a dead application, so acting affordances must
  // render visibly disabled rather than fire doomed requests
  // (ui-rules.md disabled-state rule).
  canAct: boolean
  onSchedule: (stage: TestStageDto) => void
  onRecordResult: (stage: TestStageDto) => void
}) {
  // STEP 1: Attempt counts — the "· N failed attempt(s)" hint on a
  //         Schedule-state stage is derived from the appointment history
  //         (Session 14 contract: history is the retake source), never
  //         guessed from the stage's own fields.
  const failedAttemptsFor = (stage: TestStageDto): number =>
    pipeline.history.filter(
      (appointment) =>
        appointment.testTypeId === stage.testTypeId && appointment.test?.result === false,
    ).length

  // STEP 2: Render the three ordered stages; the number badge is the
  //         stage's position in the sequence (1..3).
  return (
    <div>
      <div className="space-y-3">
        {pipeline.stages.map((stage, index) => {
          const position = index + 1

          if (stage.status === "Passed") {
            return (
              // Passed — soft green surface; name + cost in dark green.
              <div
                key={stage.testTypeId}
                className="flex items-center gap-3 rounded-lg border border-success/20 bg-success-tint p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
                  <CircleCheck className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-success-tint-foreground">
                    {stage.title}
                  </p>
                  <p className="text-xs text-success-tint-foreground/80">
                    {stage.description}
                    {stage.paidFees ? ` · ${formatFee(stage.paidFees)}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success-tint-foreground">
                  Passed
                </span>
              </div>
            )
          }

          if (stage.status === "Scheduled") {
            return (
              // Scheduled — current stage WITH an open booking: amber
              // date pill + the Record Result action. This is the only
              // place the record action exists (invariant #19: the UI
              // must not expose recording for a stage whose predecessor
              // hasn't Passed — the server computes 'current' and this
              // branch is unreachable for locked stages).
              <div
                key={stage.testTypeId}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-primary-foreground">
                  {position}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{stage.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {stage.description}
                    {stage.paidFees ? ` · ${formatFee(stage.paidFees)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {stage.appointmentDate && (
                    <span className="rounded-full bg-warning-tint px-2.5 py-0.5 text-xs font-medium text-warning-tint-foreground">
                      Scheduled {formatDate(stage.appointmentDate)}
                    </span>
                  )}
                  <Button
                    className="h-9"
                    disabled={!canAct || !stage.appointmentId}
                    title={
                      canAct
                        ? undefined
                        : "This application is no longer active — no test results can be recorded."
                    }
                    onClick={() => onRecordResult(stage)}
                  >
                    Record Result
                  </Button>
                </div>
              </div>
            )
          }

          if (stage.status === "Schedule") {
            const attempts = failedAttemptsFor(stage)
            return (
              // Schedule — current stage with NO open booking (fresh or
              // retake after a fail; Session 14: a failed attempt never
              // gets its own state, the stage stays 'Schedule' with the
              // count read from history, invariant #21).
              <div
                key={stage.testTypeId}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-medium text-primary-foreground">
                  {position}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{stage.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {attempts > 0
                      ? `· ${attempts} failed attempt${attempts > 1 ? "s" : ""}`
                      : stage.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="h-9 bg-card"
                  disabled={!canAct}
                  title={
                    canAct
                      ? undefined
                      : "This application is no longer active — no appointments can be scheduled."
                  }
                  onClick={() => onSchedule(stage)}
                >
                  <Calendar aria-hidden="true" />
                  Schedule
                </Button>
              </div>
            )
          }

          return (
            // Locked — every stage beyond the current one: unreachable
            // until the predecessor passes (invariant #19); everything is
            // deliberately inert.
            <div
              key={stage.testTypeId}
              className="flex items-center gap-3 rounded-lg border border-border bg-muted p-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted-foreground/25 text-sm font-medium text-muted-foreground">
                {position}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-muted-foreground">{stage.title}</p>
                <p className="text-xs text-muted-foreground/80">{stage.description}</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-tint px-2.5 py-0.5 text-xs font-medium text-neutral-tint-foreground">
                <Lock className="size-3" aria-hidden="true" />
                Locked
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}