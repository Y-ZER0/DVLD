"use client"

import { Badge } from "@/components/ui/badge"
import { ApplicationStatus, ApplicationType, type DashboardRecentApplicationDto } from "@repo/shared"

const APPLICATION_TYPE_LABELS: Record<string, string> = {
  [ApplicationType.NEW_DRIVING_LICENSE]: "New Local Driving License",
  [ApplicationType.RENEW_DRIVING_LICENSE]: "Renew Driving License",
  [ApplicationType.REPLACEMENT_FOR_DAMAGED_LICENSE]: "Replacement for Damaged License",
  [ApplicationType.REPLACEMENT_FOR_LOST_LICENSE]: "Replacement for Lost License",
  [ApplicationType.RELEASE_DETAINED_LICENSE]: "Release Detained License",
  [ApplicationType.NEW_INTERNATIONAL_LICENSE]: "New International License",
}

const STATUS_PILL_CLASSES: Record<string, string> = {
  [ApplicationStatus.NEW]: "bg-warning-tint text-warning-tint-foreground border-transparent",
  [ApplicationStatus.COMPLETED]: "bg-success/10 text-success border-transparent",
  [ApplicationStatus.CANCELLED]: "bg-destructive/10 text-destructive border-transparent",
}

export function RecentApplicationsCard({ rows }: { rows: DashboardRecentApplicationDto[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-5 pt-5 pb-3">
        <h2 className="text-sm font-semibold">Recent Applications</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest activity across all application types.
        </p>
      </div>
      {rows.length === 0 ? (
        <div className="border-t px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">No recent applications</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-border bg-muted/30">
                <th className="px-5 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground">
                  Applicant
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground">
                  Type
                </th>
                <th className="px-5 py-2.5 text-left text-xs font-medium tracking-wide text-muted-foreground">
                  Status
                </th>
                <th className="px-5 py-2.5 text-right text-xs font-medium tracking-wide text-muted-foreground">
                  Fees
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.applicationId} className="hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{row.applicantName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{row.nationalNumber}</p>
                  </td>
                  <td className="px-5 py-3 text-sm">
                    {APPLICATION_TYPE_LABELS[row.applicationTypeTitle] ?? row.applicationTypeTitle}
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={STATUS_PILL_CLASSES[row.applicationStatus] ?? ""}>
                      {row.applicationStatus}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right font-mono text-sm tabular-nums">
                    ${Number(row.paidFees).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
