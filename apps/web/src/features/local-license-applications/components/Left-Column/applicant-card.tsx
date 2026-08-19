"use client"

import { Award } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ApplicationStatus,
  type LicenseDto,
  type LocalDrivingLicenseApplicationDto,
} from "@repo/shared"

const STATUS_PILL_CLASSES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NEW]: "bg-warning-tint text-warning-tint-foreground",
  [ApplicationStatus.COMPLETED]: "bg-success/15 text-success-tint-foreground",
  [ApplicationStatus.CANCELLED]: "bg-destructive-tint text-destructive",
}

function formatFee(paidFees: string): string {
  return `$${paidFees}`
}

function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

export function ApplicantCard({
  application,
  licenseFee,
  allPassed,
  issuedLicense,
  onIssueLicense,
}: {
  application: LocalDrivingLicenseApplicationDto
  licenseFee: string | undefined
  allPassed: boolean
  issuedLicense: LicenseDto | null
  onIssueLicense: () => void
}) {
  return (
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

      <CardFooter className="border-t border-border px-6 py-4">
        {issuedLicense ? (
          <div className="w-full rounded-lg border border-success/20 bg-success-tint p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-success">
              <Award className="size-4 shrink-0" aria-hidden="true" />
              License <span className="font-mono">LIC-{issuedLicense.id}</span> issued
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Valid {issuedLicense.issueDate} to {issuedLicense.expirationDate}
            </p>
          </div>
        ) : application.applicationStatus === ApplicationStatus.COMPLETED ? (
          <div className="w-full rounded-lg border border-success/20 bg-success-tint p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-success">
              <Award className="size-4 shrink-0" aria-hidden="true" />
              License issued
            </p>
          </div>
        ) : allPassed ? (
          <Button type="button" className="h-11 w-full" onClick={onIssueLicense}>
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
  )
}
