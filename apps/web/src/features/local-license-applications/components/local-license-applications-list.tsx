"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, FileStack, SearchX } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { ApplicationStatus, type LocalDrivingLicenseApplicationDto } from "@repo/shared"
import { useLocalLicenseApplications } from "../hooks/use-local-license-applications"

// LocalLicenseApplicationsList — the 4.2 application register screen
// (ui-registry.md DataTable): owns the list's search + page state and
// feeds the shared DataTable this feature's six columns. Test Progress is
// a placeholder "0/3" (Feature 5 owns the pipeline state — build-plan.md
// § 4.2); the Status pill follows the ui-rules.md color mapping (New =
// warning, Completed = success, Cancelled = destructive); the Manage cell
// navigates to the application's detail page.

const PAGE_SIZE = 10

// Max possible tests per application — Vision, Written, Street. Feature 5
// replaces the placeholder that hardcodes zero completions.
const TOTAL_TESTS = 3

// Status pill token mapping (ui-rules.md § Status Color Mapping): every
// state shows color AND label — never color alone. Same soft-tinted
// Badge treatment as the users Active/Inactive pills.
const STATUS_PILL_CLASSES: Record<ApplicationStatus, string> = {
  [ApplicationStatus.NEW]: "bg-warning/10 text-warning",
  [ApplicationStatus.COMPLETED]: "bg-success/10 text-success",
  [ApplicationStatus.CANCELLED]: "bg-destructive/10 text-destructive",
}

export function LocalLicenseApplicationsList() {
  const router = useRouter()

  // STEP 1: Search state lives here (transient UI state, not server state
  //         — invariant #1). The input updates instantly; the query only
  //         runs after a 300ms pause so typing doesn't fire a request per
  //         keystroke.
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    // STEP 2: Debounce: reset the timer on every keystroke, commit after
    //         300ms of silence. Returning to page 1 on a new filter
    //         matters — a result set on page 4 may not exist under the
    //         new search.
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isPending, isError, refetch } = useLocalLicenseApplications({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // STEP 3: Column definitions — the application-specific cell rendering
  //         handed to the shared DataTable. Built here (not module-level)
  //         because the Manage cell closes over the router.
  const columns: DataTableColumn<LocalDrivingLicenseApplicationDto>[] = [
    {
      // STEP 4: "App No." is the generic Applications row id rendered in
      //         the reference screenshots' mono "L-X" form.
      header: "App No.",
      cell: (application) => (
        <span className="font-mono text-sm font-bold">
          L-{application.applicationId}
        </span>
      ),
    },
    {
      // STEP 5: Applicant cell — full name (bold) stacked over the
      //         national number (smaller, muted, mono), the registry-wide
      //         two-line cell shape (people-list precedent).
      header: "Applicant",
      cell: (application) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{application.applicantName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {application.nationalNumber}
          </p>
        </div>
      ),
    },
    {
      header: "Class",
      cell: (application) => <span className="text-sm">{application.className}</span>,
    },
    {
      // STEP 6: Test Progress — slim blue progress bar next to the "x/3"
      //         fraction. PLACEHOLDER until Feature 5: no pipeline state
      //         exists yet, so every row shows an empty track and 0/3;
      //         5.2 replaces the constant with the live stage count.
      header: "Test Progress",
      cell: () => {
        const completed = 0
        const percent = (completed / TOTAL_TESTS) * 100
        return (
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="h-1.5 w-24 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm tabular-nums">
              {completed}/{TOTAL_TESTS}
            </span>
          </div>
        )
      },
    },
    {
      // STEP 7: Status pill — soft tinted background + dark matching text
      //         per the spec, tokens from the ui-rules mapping.
      header: "Status",
      cell: (application) => (
        <Badge className={STATUS_PILL_CLASSES[application.applicationStatus]}>
          {application.applicationStatus}
        </Badge>
      ),
    },
    {
      // STEP 8: Manage — right-aligned outline action button. The detail
      //         screen (4.2 shell) is where Features 5/6 attach the
      //         pipeline, so the whole row's action is navigation.
      header: "Manage",
      headerClassName: "text-right",
      className: "text-right",
      cell: (application) => (
        <Button
          variant="outline"
          className="h-10 bg-card"
          onClick={() => router.push(`/applications/local/${application.id}`)}
        >
          Open
          <ArrowRight aria-hidden="true" />
        </Button>
      ),
    },
  ]

  // STEP 9: Empty state — two variants (ui-rules.md EmptyState, never a
  //         bare header row): a committed search that matches nothing vs.
  //         an office with zero applications on file.
  const emptyState = debouncedSearch ? (
    <>
      <SearchX aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">No applications match "{debouncedSearch}"</p>
      <p className="text-xs text-muted-foreground">
        Try a different applicant name or national number.
      </p>
    </>
  ) : (
    <>
      <FileStack aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">No local driving license applications yet</p>
      <p className="text-xs text-muted-foreground">
        Use "New Application" to file the first one.
      </p>
    </>
  )

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(application) => application.id}
      isPending={isPending}
      isError={isError}
      onRetry={refetch}
      errorMessage="Could not load the application register."
      empty={emptyState}
      searchValue={searchInput}
      onSearchChange={setSearchInput}
      searchPlaceholder="Filter by applicant, national number, class..."
      searchLabel="Filter applications"
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  )
}