"use client"

import type { LicenseClassDto } from "@repo/shared"
import { useUpdateLicenseClass } from "../hooks/use-update-license-class"
import { ConfigNumberField } from "./config-number-field"

export function LicenseClassesCard({ rows }: { rows: LicenseClassDto[] }) {
  const update = useUpdateLicenseClass()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold">License classes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border">
              <th className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Class</th>
              <th className="w-[112px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Min age</th>
              <th className="w-[112px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Validity (yrs)</th>
              <th className="w-[112px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Fee ($)</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].sort((a, b) => a.id - b.id).map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 text-sm text-muted-foreground tabular-nums">{row.id}</td>
                <td className="px-4 py-2.5 text-sm">{row.className}</td>
                <td className="px-4 py-2.5">
                  <ConfigNumberField
                    value={row.minimumAllowedAge}
                    ariaLabel={`Minimum age for ${row.className}`}
                    integer
                    min={1}
                    max={120}
                    onSave={(val) => update.mutateAsync({ id: row.id, dto: { minimumAllowedAge: val } })}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <ConfigNumberField
                    value={row.defaultValidityLength}
                    ariaLabel={`Validity for ${row.className}`}
                    integer
                    min={1}
                    max={50}
                    onSave={(val) => update.mutateAsync({ id: row.id, dto: { defaultValidityLength: val } })}
                  />
                </td>
                <td className="px-4 py-2.5">
                  <ConfigNumberField
                    value={row.classFees}
                    ariaLabel={`Fee for ${row.className}`}
                    min={0}
                    max={99999999.99}
                    maxDecimals={2}
                    onSave={(val) => update.mutateAsync({ id: row.id, dto: { classFees: val } })}
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
