"use client"

import { ApplicationType, type ApplicationTypeDto } from "@repo/shared"
import { useUpdateApplicationType } from "../hooks/use-update-application-type"
import { ConfigNumberField } from "./config-number-field"

const APPLICATION_TYPE_LABELS: Record<ApplicationType, string> = {
  [ApplicationType.NEW_DRIVING_LICENSE]: "New Local Driving License",
  [ApplicationType.RENEW_DRIVING_LICENSE]: "Renew Driving License",
  [ApplicationType.REPLACEMENT_FOR_DAMAGED_LICENSE]: "Replacement for Damaged License",
  [ApplicationType.REPLACEMENT_FOR_LOST_LICENSE]: "Replacement for Lost License",
  [ApplicationType.RELEASE_DETAINED_LICENSE]: "Release Detained License",
  [ApplicationType.NEW_INTERNATIONAL_LICENSE]: "New International License",
}

export function ApplicationTypesCard({ rows }: { rows: ApplicationTypeDto[] }) {
  const update = useUpdateApplicationType()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold">Application types</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border">
              <th className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Title</th>
              <th className="w-[112px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Fee ($)</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].sort((a, b) => a.id - b.id).map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 text-sm text-muted-foreground tabular-nums">{row.id}</td>
                <td className="px-4 py-2.5 text-sm">{APPLICATION_TYPE_LABELS[row.applicationTypeTitle] ?? row.applicationTypeTitle}</td>
                <td className="px-4 py-2.5">
                  <ConfigNumberField
                    value={row.applicationFees}
                    ariaLabel={`Fee for ${APPLICATION_TYPE_LABELS[row.applicationTypeTitle] ?? row.applicationTypeTitle}`}
                    min={0}
                    max={99999999.99}
                    maxDecimals={2}
                    onSave={(val) => update.mutateAsync({ id: row.id, dto: { applicationFees: val } })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
