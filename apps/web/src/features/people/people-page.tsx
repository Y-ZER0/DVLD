"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddPersonModal } from "./components/add-person-modal"
import { PeopleList } from "./components/people-list"

export function PeoplePage() {
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