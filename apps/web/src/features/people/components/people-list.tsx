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

const PAGE_SIZE = 10

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
  const millis = Date.now() - dob.getTime()
  return Math.floor(millis / (365.25 * 24 * 60 * 60 * 1000))
}

export function PeopleList() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
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