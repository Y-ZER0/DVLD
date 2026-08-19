"use client"

import { useState } from "react"
import { ArrowLeft, CircleAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ApplicationStatus, type LicenseDto, type TestStageDto } from "@repo/shared"
import { useLicenseClasses } from "@/features/lookup/hooks/use-license-classes"
import { useLocalLicenseApplication } from "./hooks/use-local-license-application"
import { useTestPipeline } from "./hooks/use-test-pipeline"
import { ApplicantCard } from "./components/Left-Column/applicant-card"
import { CancelApplicationDialog } from "./components/Modals/cancel-application-dialog"
import { IssueLicenseModal } from "./components/Modals/issue-license-modal"
import { RecordResultModal } from "./components/Modals/record-result-modal"
import { ScheduleAppointmentModal } from "./components/Modals/schedule-appointment-modal"
import { TestPipelineSectionCard } from "./components/Right-Column/test-pipeline-section-card"

// LocalLicenseApplicationDetailPage — the 5.2 application detail page
// (descriptive-prompt spec, replacing the 4.2 shell): back link + header
// bar with the tinted Cancel action, ~1/3-2/3 two-column grid — LEFT the
// ApplicantCard (avatar block, key-value metadata rows, full-width
// Issue License CTA whose enabled/disabled states follow the pipeline —
// wired in 6.2 to the issuance modal, after which a green
// post-issuance banner replaces the CTA), RIGHT the TestPipelineSectionCard
// (Test Pipeline stepper + Appointment History stacked vertically).
// Action affordances (Schedule / Record Result / new bookings) are gated
// on the application status remaining New — the 5.1 service 409s every
// test write on a Cancelled/Completed application (one-way door
// precedent), so the UI renders them visibly disabled instead of firing
// doomed requests.

// STEP 1: Display formatting helper — dates are ISO strings rendered in
//         the user's locale.
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
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
  //         state so the right modal opens for the right stage; the
  //         issuance flow adds its own open flag + the issued license
  //         lifted from the mutation response (the banner on the
  //         ApplicantCard renders from it — server truth, no refetch).
  const [cancelOpen, setCancelOpen] = useState(false)
  const [scheduleStage, setScheduleStage] = useState<TestStageDto | null>(null)
  const [recordStage, setRecordStage] = useState<TestStageDto | null>(null)
  const [issueOpen, setIssueOpen] = useState(false)
  const [issuedLicense, setIssuedLicense] = useState<LicenseDto | null>(null)

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
        {/* STEP 10: LEFT — Applicant & Application Details card with the
                 full-width footer CTA (own component so the grid stays
                 1/3-2/3 and the CTA/banner states live with the card);
                 the click opens the 6.2 issuance modal. */}
        <ApplicantCard
          application={application}
          licenseFee={licenseFee}
          allPassed={allPassed}
          issuedLicense={issuedLicense}
          onIssueLicense={() => setIssueOpen(true)}
        />

        {/* STEP 11: RIGHT — one white card holding the Test Pipeline
                 stepper + Appointment History stacked vertically, with
                 the query's pending/error states rendered inside. */}
        <TestPipelineSectionCard
          pipeline={pipelineQuery.data}
          isPending={pipelineQuery.isPending}
          isError={pipelineQuery.isError}
          onRetry={() => pipelineQuery.refetch()}
          canAct={canAct}
          onSchedule={(stage) => setScheduleStage(stage)}
          onRecordResult={(stage) => setRecordStage(stage)}
        />
      </div>

{/* STEP 12: Dialogs — cancel confirm, schedule + record modals bound
                to the stage they were opened for, and the issuance
                modal; closing clears the stage/open flag so a stale
                stage can never reopen the wrong modal. */}
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

      {issueOpen && (
        <IssueLicenseModal
          open
          onOpenChange={(open) => {
            if (!open) setIssueOpen(false)
          }}
          application={application}
          licenseFee={licenseFee}
          onIssued={(license) => setIssuedLicense(license)}
        />
      )}
    </div>
  )
}