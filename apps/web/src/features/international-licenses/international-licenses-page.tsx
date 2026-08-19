"use client"

import { useState } from "react"
import { BadgePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InternationalLicensesTable } from "./components/international-licenses-table"
import { IssueInternationalLicenseModal } from "./components/Modals/issue-international-license-modal"

export function InternationalLicensesPage() {
  const [issueOpen, setIssueOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">International Licenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue and track international driving licenses. Requires an active Class 3 (Car)
            local license.
          </p>
        </div>
        <Button className="h-10" onClick={() => setIssueOpen(true)}>
          <BadgePlus aria-hidden="true" />
          New International License
        </Button>
      </div>

      <InternationalLicensesTable />

      <IssueInternationalLicenseModal open={issueOpen} onOpenChange={setIssueOpen} />
    </div>
  )
}