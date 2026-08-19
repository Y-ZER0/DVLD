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

// Status pill token mapping, same as the register list (ui-rules.md).
const STATUS_PILL_CLASSES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NEW]: "bg-warning-tint text-warning-tint-foreground",
  [ApplicationStatus.COMPLETED]: "bg-success/15 text-success-tint-foreground",
  [ApplicationStatus.CANCELLED]: "bg-destructive-tint text-destructive",
}

// Display helper — the fee arrives as a decimal string ("15.00"),
// display-only client-side (invariant #28).
function formatFee(paidFees: string): string {
  return `$${paidFees}`
}

// Avatar initials — first letters of the first two name words, the TopBar
// convention (e.g. "Marcus Reid" → "MR").
function initialsOf(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
}

// ApplicantCard — the LEFT column of the application detail page's two-
// column grid: profile block (avatar + name + national ID), divider, then
// the right-aligned key-value rows (Status pill, License Class, Application
// Fee snapshot, live License Fee), and the full-width footer whose content
// depends on issuance state (6.2): a green post-issuance banner once a
// license is issued (or once the application is Completed — the 6.1
// one-way door, no second offer of the CTA), otherwise the two-state
// Issue License CTA pinned to the card footer.
export function ApplicantCard({
  application,
  licenseFee,
  allPassed,
  issuedLicense,
  onIssueLicense,
}: {
  application: LocalDrivingLicenseApplicationDto
  // Live ClassFees for the application's class, read from the lookup
  // register (invariant #28: the issuance would snapshot this at
  // transaction time; the UI never hardcodes a fee and never recomputes
  // it). Renders "—" until the lookup resolves.
  licenseFee: string | undefined
  // The Issue License CTA's enabled state follows the pipeline — the
  // disabled label explains WHY (ui-rules.md), and the all-passed gate
  // mirrors invariant #22 (the 6.1 service re-checks the gate
  // server-side at issuance time).
  allPassed: boolean
  // The license the 6.2 modal returned — its presence swaps the CTA for
  // the post-issuance banner ("License LIC-N issued — Valid <issue> to
  // <expiry>", ui-registry ConfirmationBanner).
  issuedLicense: LicenseDto | null
  // Opens the 6.2 issuance modal — wired only on the enabled CTA
  // variant, so the disabled variant stays a no-op with its title
  // explaining why.
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

      {/* Footer — full-width, three cases (6.2): a license was issued →
          the green post-issuance banner replaces the CTA (spec § 3,
          ui-registry ConfirmationBanner); a Completed application
          without local license state (page refreshed after issuance) →
          the banner without fabricated specifics — the one-way door
          means the CTA must never be offered again; otherwise the
          two-state CTA, its enabled variant wired to the issuance
          modal. */}
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
