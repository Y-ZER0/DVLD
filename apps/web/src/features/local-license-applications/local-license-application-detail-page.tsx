"use client"

import { useState } from "react"
import { ArrowLeft, Award, CircleAlert } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ApplicationStatus,
  type LocalDrivingLicenseApplicationDto,
  type TestStageDto,
} from "@repo/shared"
import { useLicenseClasses } from "@/features/lookup/hooks/use-license-classes"
import { useLocalLicenseApplication } from "./hooks/use-local-license-application"
import { useTestPipeline } from "./hooks/use-test-pipeline"
import { CancelApplicationDialog } from "./components/cancel-application-dialog"
import { TestPipelineCard } from "./components/test-pipeline-card"
import { AppointmentHistoryList } from "./components/appointment-history-list"
import { ScheduleAppointmentModal } from "./components/schedule-appointment-modal"
import { RecordResultModal } from "./components/record-result-modal"

// LocalLicenseApplicationDetailPage — the 5.2 application detail page
// (descriptive-prompt spec, replacing the 4.2 shell): back link + header
// bar with the tinted Cancel action, ~1/3-2/3 two-column grid — LEFT the
// Applicant card (avatar block, key-value metadata rows, full-width
// Issue License CTA whose enabled/disabled states follow the pipeline),
// RIGHT one white card holding the Test Pipeline stepper + Appointment
// History stacked vertically. Action affordances (Schedule / Record
// Result / new bookings) are gated on the application status remaining
// New — the 5.1 service 409s every test write on a Cancelled/Completed
// application (one-way door precedent), so the UI renders them visibly
// disabled instead of firing doomed requests.

// Status pill token mapping, same as the register list (ui-rules.md).
const STATUS_PILL_CLASSES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NEW]: "bg-warning-tint text-warning-tint-foreground",
  [ApplicationStatus.COMPLETED]: "bg-success/15 text-success-tint-foreground",
  [ApplicationStatus.CANCELLED]: "bg-destructive-tint text-destructive",
}

// STEP 1: Display formatting helpers — the fee arrives as a decimal
//         string ("15.00"), display-only client-side (invariant #28);
//         dates are ISO strings rendered in the user's locale.
function formatFee(paidFees: string): string {
  return `$${paidFees}`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

// STEP 2: Avatar initials — first letters of the first two name words,
//         the TopBar convention (e.g. "Marcus Reid" → "MR").
function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

export function LocalLicenseApplicationDetailPage({ id }: { id: number }) {
  // STEP 3: Two independent queries feed this screen — the application
  //         summary (status, fees, applicant) and the 5.1 pipeline
  //         (stages + history). The schedule/record mutations invalidate
  //         BOTH keys, so the modal-driven state transitions re-derive
  //         from server truth (invariant #6).
  const { data: application, isPending, isError, refetch } = useLocalLicenseApplication(id)
  const pipelineQuery = useTestPipeline(id)

  // STEP 4: Modal orchestration — the stage being acted on rides in
  //         state so the right modal opens for the right stage.
  const [cancelOpen, setCancelOpen] = useState(false)
  const [scheduleStage, setScheduleStage] = useState<TestStageDto | null>(null)
  const [recordStage, setRecordStage] = useState<TestStageDto | null>(null)

  // STEP 5: License Fee (on issue) — the current ClassFees for the
  //         application's class, read LIVE from the lookup register
  //         (invariant #28: the issuance would snapshot this at
  //         transaction time; the UI never hardcodes a fee and never
  //         recomputes it).
  const licenseClasses = useLicenseClasses()
  const licenseFee = licenseClasses.data?.find(
    (licenseClass) => licenseClass.id === application?.licenseClassId,
  )?.classFees

  // STEP 6: Loading — skeleton cards keep the two-column layout stable
  //         while the queries resolve (no layout jump).
  if (isPending && !application) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  // STEP 7: Error state — centered retry, the established list/detail
  //         pattern.
  if (isError || !application) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card py-16 text-center shadow-sm"
      >
        <CircleAlert aria-hidden="true" className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Could not load this application.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  // STEP 8: The Issue License CTA's enabled state follows the pipeline —
  //         the disabled label explains WHY (ui-rules.md), and the
  //         all-passed gate mirrors invariant #22 (the 5.1/6.1 service
  //         re-checks the gate server-side at issuance time).
  const allPassed =
    (pipelineQuery.data?.stages.length ?? 0) > 0 &&
    pipelineQuery.data?.stages.every((stage) => stage.status === "Passed") === true
  const canAct = application.applicationStatus === ApplicationStatus.NEW
  const canCancel = application.applicationStatus === ApplicationStatus.NEW

  return (
    <div className="flex flex-col gap-6">
      {/* STEP 9: Page action header bar — back link first, then the
               title row with the tinted Cancel action (rendered only for
               New applications: cancellation is a one-way door). */}
      <Link
        href="/applications/local"
        className="flex w-fit items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Applications
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Application{" "}
            <span className="font-mono">L-{application.applicationId}</span>{" "}
            <span className="ml-1 text-lg font-medium text-muted-foreground">
              filed {formatDate(application.applicationDate)}
            </span>
          </h1>
        </div>
        {canCancel && (
          <Button
            variant="outline"
            className="h-10 border-destructive/30 bg-destructive-tint text-destructive hover:bg-destructive-tint/70 hover:text-destructive"
            onClick={() => setCancelOpen(true)}
          >
            Cancel Application
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* STEP 10: LEFT — Applicant & Application Details card: profile
                 block (avatar + name + national ID), divider, then the
                 right-aligned key-value rows (Status pill, License
                 Class, Application Fee snapshot, live License Fee), and
                 the full-width Issue License CTA pinned to the card
                 footer. */}
        <Card className="h-fit rounded-xl shadow-sm">
          <CardHeader className="border-b border-border px-6 py-5">
            <CardTitle className="text-lg font-semibold">Applicant</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-11">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initialsOf(application.applicantName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{application.applicantName}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {application.nationalNumber}
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-border" />

            <dl className="mt-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd>
                  <Badge className={STATUS_PILL_CLASSES[application.applicationStatus]}>
                    {application.applicationStatus}
                  </Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">License Class</dt>
                <dd className="text-sm font-semibold">{application.className}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">Application Fee</dt>
                <dd className="text-sm tabular-nums">{formatFee(application.paidFees)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-sm text-muted-foreground">License Fee (on issue)</dt>
                <dd className="text-sm tabular-nums">
                  {licenseFee ? formatFee(licenseFee) : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>

          {/* STEP 11: Footer CTA — full-width. Disabled state = gray-blue
                   fill + white text + the "why" label; enabled state =
                   solid primary "Issue License". Feature 6.2 wires the
                   click to the issuance flow + confirmation modal; until
                   then the enabled variant renders and remains inert
                   (the gate can only open after 6.1 exists). */}
          <CardFooter className="border-t border-border px-6 py-4">
            {allPassed ? (
              <Button type="button" className="h-11 w-full">
                <Award aria-hidden="true" />
                Issue License
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 w-full bg-muted-solid text-primary-foreground hover:bg-muted-solid/90"
                aria-disabled="true"
                title="All three test stages must show Passed before a license can be issued (feature 6)."
              >
                <Award aria-hidden="true" />
                Issue License (pass all tests first)
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* STEP 12: RIGHT — one white card with the two stacked sections:
                 Test Pipeline (title + the spec's exact subtitle, then
                 the 3 stage cards fed by the pipeline query) and, below a
                 divider, Appointment History (title + rows). Pipeline
                 loading renders skeleton stage bars; an error renders an
                 inline retry instead of a broken stepper. */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="border-b border-border px-6 py-5">
            <CardTitle className="text-lg font-semibold">Test Pipeline</CardTitle>
            <CardDescription>
              Strict sequence: Vision Test, then Written Test, then Street Test. Appointments
              lock once a result is recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-5">
            {pipelineQuery.isPending && !pipelineQuery.data ? (
              <div className="space-y-3">
                <Skeleton className="h-[72px] rounded-lg" />
                <Skeleton className="h-[72px] rounded-lg" />
                <Skeleton className="h-[72px] rounded-lg" />
              </div>
            ) : pipelineQuery.isError || !pipelineQuery.data ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card py-10 text-center"
              >
                <CircleAlert aria-hidden="true" className="size-7 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Could not load the test pipeline.</p>
                <Button variant="outline" onClick={() => pipelineQuery.refetch()}>
                  Try again
                </Button>
              </div>
            ) : (
              <>
                <TestPipelineCard
                  pipeline={pipelineQuery.data}
                  canAct={canAct}
                  onSchedule={(stage) => setScheduleStage(stage)}
                  onRecordResult={(stage) => setRecordStage(stage)}
                />

                <div className="my-6 border-t border-border" />

                <h3 className="text-lg font-semibold">Appointment History</h3>
                <div className="mt-3">
                  <AppointmentHistoryList history={pipelineQuery.data.history} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* STEP 13: Dialogs — cancel confirm, schedule + record modals bound
               to the stage they were opened for; closing clears the stage
               so a stale stage can never reopen the wrong modal. */}
      {cancelOpen && (
        <CancelApplicationDialog
          application={application}
          onOpenChange={(open) => {
            if (!open) setCancelOpen(false)
          }}
        />
      )}

      {scheduleStage && (
        <ScheduleAppointmentModal
          open
          onOpenChange={(open) => {
            if (!open) setScheduleStage(null)
          }}
          applicationId={application.id}
          stage={scheduleStage}
        />
      )}

      {recordStage && (
        <RecordResultModal
          open
          onOpenChange={(open) => {
            if (!open) setRecordStage(null)
          }}
          applicationId={application.id}
          stage={recordStage}
        />
      )}
    </div>
  )
}