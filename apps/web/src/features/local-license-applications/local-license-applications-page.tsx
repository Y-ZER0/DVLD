"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LocalLicenseApplicationsList } from "./components/local-license-applications-list"
import { NewLocalApplicationModal } from "./components/Modals/new-local-application-modal"

export function LocalLicenseApplicationsPage() {
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