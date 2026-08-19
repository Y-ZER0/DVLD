"use client"

import { LicenseRegisterTable } from "./components/license-register-table"

export function RenewalsReplacementsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Renewals &amp; Replacements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Issuing a renewal or replacement automatically deactivates the previous license.
        </p>
      </div>

      <LicenseRegisterTable />
    </div>
  )
}