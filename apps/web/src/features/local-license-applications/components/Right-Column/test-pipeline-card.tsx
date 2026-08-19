"use client"

import { Calendar, CircleCheck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TestPipelineDto, TestStageDto } from "@repo/shared"

function formatFee(paidFees: string): string {
  return `$${paidFees}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

export function TestPipelineCard({
  pipeline,
  canAct,
  onSchedule,
  onRecordResult,
}: {
  pipeline: TestPipelineDto
  canAct: boolean
  onSchedule: (stage: TestStageDto) => void
  onRecordResult: (stage: TestStageDto) => void
}) {
  const failedAttemptsFor = (stage: TestStageDto): number =>
    pipeline.history.filter(
      (appointment) =>
        appointment.testTypeId === stage.testTypeId && appointment.test?.result === false,
    ).length

  return (
    <div>
      <div className="space-y-3">
        {pipeline.stages.map((stage, index) => {
          const position = index + 1

          if (stage.status === "Passed") {
            return (
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