"use client"

import { useEffect, useState } from "react"
import { Pencil, SearchX, Trash2, Users } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { PersonDto } from "@repo/shared"
import { usePeople } from "../hooks/use-people"
import { EditPersonModal } from "./edit-person-modal"
import { DeletePersonDialog } from "./delete-person-dialog"

// PeopleList — the 1.2 citizen-registry screen (ui-registry.md DataTable):
// owns the list's search + page state and orchestrates the Add/Edit/Delete
// dialogs. The visual table (filter bar, table region, footer) is the
// shared DataTable component, fed here with this feature's column
// definitions, empty state, and query states.

const PAGE_SIZE = 10

// STEP 1: Derive display values from the flat record — initials for the
//         avatar, age from the DOB string, and the "X yrs · Male/Female"
//         cell format from the spec.
function getInitials(person: PersonDto): string {
  const parts = [person.firstName, person.lastName].filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function getAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return 0
  // STEP 1a: Whole-year age — floor the fractional years between DOB and
  //          today; 365.25 accounts for leap years well enough for a
  //          registry display.
  const millis = Date.now() - dob.getTime()
  return Math.floor(millis / (365.25 * 24 * 60 * 60 * 1000))
}

export function PeopleList() {
  // STEP 2: Search state lives here (transient UI state, not server state
  //         — invariant #1). The input updates instantly; the query only
  //         runs after a 300ms pause so typing doesn't fire a request per
  //         keystroke.
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    // STEP 3: Debounce: reset the timer on every keystroke, commit after
    //         300ms of silence. Returning to page 1 on a new filter
    //         matters — a result set on page 4 may not exist under the
    //         new search.
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isPending, isError, refetch } = usePeople({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const [editPerson, setEditPerson] = useState<PersonDto | null>(null)
  const [deletePerson, setDeletePerson] = useState<PersonDto | null>(null)

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // STEP 4: Column definitions — the person-specific cell rendering handed
  //         to the shared DataTable. Built here (not module-level) because
  //         the Actions cell closes over the edit/delete setters. The
  //         Roles column is DEFERRED — build-plan.md § 1.2.
  const columns: DataTableColumn<PersonDto>[] = [
    {
      header: "Person",
      cell: (person) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {getInitials(person)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {person.firstName} {person.lastName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {person.countryName}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "National No.",
      cell: (person) => (
        <span className="font-mono text-sm">{person.nationalNumber}</span>
      ),
    },
    {
      header: "Age / Gender",
      cell: (person) => (
        <span className="text-sm">
          {getAge(person.dateOfBirth)} yrs · {person.gender}
        </span>
      ),
    },
    {
      header: "Contact",
      cell: (person) => (
        <div className="min-w-0 max-w-52">
          <p className="truncate text-sm" title={person.phone}>
            {person.phone}
          </p>
          <p className="truncate text-xs text-muted-foreground" title={person.email}>
            {person.email}
          </p>
        </div>
      ),
    },
    // STEP 5: Actions — IconActionButton pattern (ui-registry.md): 40×40
    //         hit target, gray pencil edit, red trash delete. Right-aligned
    //         in both header and cells so the cluster sits on the edge.
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (person) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground"
            aria-label={`Edit ${person.firstName} ${person.lastName}`}
            onClick={() => setEditPerson(person)}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-destructive hover:text-destructive"
            aria-label={`Delete ${person.firstName} ${person.lastName}`}
            onClick={() => setDeletePerson(person)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ]

  // STEP 6: Empty state — two variants (ui-rules.md EmptyState, never a
  //         bare header row): a committed search that matches nothing vs.
  //         a registry with zero rows yet. Which variant is live depends
  //         on the debounced search, not the live input.
  const emptyState = debouncedSearch ? (
    <>
      <SearchX aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">No citizens match "{debouncedSearch}"</p>
      <p className="text-xs text-muted-foreground">
        Try a different name, national number, email, or phone.
      </p>
    </>
  ) : (
    <>
      <Users aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">No citizens registered yet</p>
      <p className="text-xs text-muted-foreground">
        Use "Add Person" to register the first citizen.
      </p>
    </>
  )

  // STEP 7: Dialog orchestration — Edit and Delete are driven by the row
  //         actions above; the Add dialog is triggered by the page
  //         header's button, so its open state is lifted to PeoplePage
  //         (PageHeader pattern, ui-registry.md) and passed down.
  return (
    <>
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(person) => person.id}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        errorMessage="Could not load the citizen registry."
        empty={emptyState}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Filter by name, national number, email, phone..."
        searchLabel="Filter people"
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {editPerson && (
        <EditPersonModal
          person={editPerson}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditPerson(null)
          }}
        />
      )}

      <DeletePersonDialog person={deletePerson} onOpenChange={() => setDeletePerson(null)} />
    </>
  )
}