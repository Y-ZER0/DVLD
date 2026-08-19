"use client"

import { CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { TestPipelineDto, TestStageDto } from "@repo/shared"
import { AppointmentHistoryList } from "../appointment-history-list"
import { TestPipelineCard } from "./test-pipeline-card"

export function TestPipelineSectionCard({
  pipeline,
  isPending,
  isError,
  onRetry,
  canAct,
  onSchedule,
  onRecordResult,
}: {
  pipeline: TestPipelineDto | undefined
  isPending: boolean
  isError: boolean
  onRetry: () => void
  canAct: boolean
  onSchedule: (stage: TestStageDto) => void
  onRecordResult: (stage: TestStageDto) => void
}) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader className="border-b border-border px-6 py-5">
        <CardTitle className="text-lg font-semibold">Test Pipeline</CardTitle>
        <CardDescription>
          Strict sequence: Vision Test, then Written Test, then Street Test. Appointments
          lock once a result is recorded.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-5">
        {isPending && !pipeline ? (
          <div className="space-y-3">
            <Skeleton className="h-[72px] rounded-lg" />
            <Skeleton className="h-[72px] rounded-lg" />
            <Skeleton className="h-[72px] rounded-lg" />
          </div>
        ) : isError || !pipeline ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-10 text-center"
          >
            <CircleAlert aria-hidden="true" className="size-7 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Could not load the test pipeline.</p>
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            <TestPipelineCard
              pipeline={pipeline}
              canAct={canAct}
              onSchedule={onSchedule}
              onRecordResult={onRecordResult}
            />

            <div className="my-6 border-t border-border" />

            <h3 className="text-lg font-semibold">Appointment History</h3>
            <div className="mt-3">
              <AppointmentHistoryList history={pipeline.history} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
