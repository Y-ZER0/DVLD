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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString()
}

export function LocalLicenseApplicationDetailPage({ id }: { id: number }) {
  const { data: application, isPending, isError, refetch } = useLocalLicenseApplication(id)
  const pipelineQuery = useTestPipeline(id)

  const [cancelOpen, setCancelOpen] = useState(false)
  const [scheduleStage, setScheduleStage] = useState<TestStageDto | null>(null)
  const [recordStage, setRecordStage] = useState<TestStageDto | null>(null)
  const [issueOpen, setIssueOpen] = useState(false)
  const [issuedLicense, setIssuedLicense] = useState<LicenseDto | null>(null)

  const licenseClasses = useLicenseClasses()
  const licenseFee = licenseClasses.data?.find(
    (licenseClass) => licenseClass.id === application?.licenseClassId,
  )?.classFees

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

  const allPassed =
    (pipelineQuery.data?.stages.length ?? 0) > 0 &&
    pipelineQuery.data?.stages.every((stage) => stage.status === "Passed") === true
  const canAct = application.applicationStatus === ApplicationStatus.NEW
  const canCancel = application.applicationStatus === ApplicationStatus.NEW

  return (
    <div className="flex flex-col gap-6">
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
        <ApplicantCard
          application={application}
          licenseFee={licenseFee}
          allPassed={allPassed}
          issuedLicense={issuedLicense}
          onIssueLicense={() => setIssueOpen(true)}
        />

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