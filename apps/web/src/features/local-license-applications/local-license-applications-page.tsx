"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocalLicenseApplicationsList } from "./components/local-license-applications-list"
import { NewLocalApplicationModal } from "./components/Modals/new-local-application-modal"

// LocalLicenseApplicationsPage — the 4.2 "Local Driving License
// Applications" screen composition (invariant #12: the page route stays
// thin; this client component owns the page chrome). PageHeader pattern
// (ui-registry.md): h1 title + muted subtitle + right-aligned primary
// action. The New Application modal's open state lives here because its
// trigger — the header button — is page chrome, while the list owns the
// search/pagination beneath.

export function LocalLicenseApplicationsPage() {
  // STEP 1: Lifted state — the "New Application" button and the (closing)
  //         modal must share one open flag.
  const [newApplicationOpen, setNewApplicationOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Local Driving License Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage new license applications through the Vision, Written, and Street test
            pipeline.
          </p>
        </div>
        <Button className="h-10" onClick={() => setNewApplicationOpen(true)}>
          <Plus aria-hidden="true" />
          New Application
        </Button>
      </div>

      <LocalLicenseApplicationsList />

      <NewLocalApplicationModal
        open={newApplicationOpen}
        onOpenChange={setNewApplicationOpen}
      />
    </div>
  )
}