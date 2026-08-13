"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPersonModal } from "./components/add-person-modal"
import { PeopleList } from "./components/people-list"

// PeoplePage — the 1.2 "People Management" screen composition (invariant
// #12: the page route stays thin; this client component owns the page
// chrome). PageHeader pattern (ui-registry.md): h1 title + muted subtitle
// + right-aligned primary action. The Add modal's open state lives here
// because its trigger — the header button — is page chrome, while PeopleList
// owns the search/pagination/dialogs beneath.

export function PeoplePage() {
  // STEP 1: Lifted state — the "Add Person" button and the (closing)
  //         modal must share one open flag.
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">People Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            National citizen registry with full CRUD and national ID validation.
          </p>
        </div>
        <Button className="h-10" onClick={() => setAddOpen(true)}>
          <Plus aria-hidden="true" />
          Add Person
        </Button>
      </div>

      <PeopleList />

      <AddPersonModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}