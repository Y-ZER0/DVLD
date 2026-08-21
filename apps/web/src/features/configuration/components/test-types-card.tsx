"use client"

import type { TestTypeDto } from "@repo/shared"
import { useUpdateTestType } from "../hooks/use-update-test-type"
import { ConfigNumberField } from "./config-number-field"

export function TestTypesCard({ rows }: { rows: TestTypeDto[] }) {
  const update = useUpdateTestType()

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-sm font-semibold">Test types</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-y border-border">
              <th className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Test</th>
              <th className="w-[112px] px-4 py-2 text-left text-xs font-medium tracking-wide text-muted-foreground">Fee ($)</th>
            </tr>
          </thead>
          <tbody>
            {[...rows].sort((a, b) => a.id - b.id).map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2.5 text-sm text-muted-foreground tabular-nums">{row.id}</td>
                <td className="px-4 py-2.5">
                  <div className="text-sm font-medium">{row.testTypeTitle} Test</div>
                  <div className="text-xs text-muted-foreground">{row.testTypeDescription}</div>
                </td>
                <td className="px-4 py-2.5">
                  <ConfigNumberField
                    value={row.testTypeFees}
                    ariaLabel={`Fee for ${row.testTypeTitle} Test`}
                    min={0}
                    max={99999999.99}
                    maxDecimals={2}
                    onSave={(val) => update.mutateAsync({ id: row.id, dto: { testTypeFees: val } })}
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
