"use client"

import { DetainLicenseFormCard } from "./components/detain-license-form-card"
import { DetentionRegisterTable } from "./components/detention-register-table"

export function DetainReleasePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Detain &amp; Release</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Violations management and license clearance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <DetainLicenseFormCard />
        <DetentionRegisterTable />
      </div>
    </div>
  )
}