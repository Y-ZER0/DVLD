"use client"

import { ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { ReactNode } from "react"
import type { Key } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// DataTable — the shared list-screen pattern (ui-registry.md DataTable),
// used by every list feature (People, Users, Applications, Drivers):
// filter input directly above the table, the row grid with the Actions
// column right-aligned, and a footer with "N records · Page X of Y" left
// and Prev/Next right. Four mutually exclusive body states — error retry,
// loading skeletons, empty state, rows — so empty never renders as a bare
// header row (ui-rules.md EmptyState). Strictly presentational: search and
// page state live in the feature component and come in as props, because
// the debounce and page-reset-on-filter rules are feature concerns.

export interface DataTableColumn<T> {
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => Key
  isPending: boolean
  isError: boolean
  onRetry: () => void
  errorMessage?: ReactNode
  empty: ReactNode
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchLabel: string
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  skeletonRows?: number
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  isPending,
  isError,
  onRetry,
  errorMessage = "Could not load the data.",
  empty,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  total,
  page,
  totalPages,
  onPageChange,
  skeletonRows = 5,
}: DataTableProps<T>) {
  // STEP 1: Filter bar — search input full-width above the table, icon
  //          left, per the spec. Value + onChange belong to the parent:
  //          the list component owns the debounce so keystrokes don't
  //          fire a request each one, and it resets the page on commit.
  // STEP 2: Table region — header row built from the column config, then
  //          exactly one body state: error (centered retry), pending with
  //          no rows yet (skeleton rows mirroring the avatar/name shape),
  //          no rows at all (feature-provided EmptyState), else the row
  //          grid. colSpan spans every column so a state never paints a
  //          ragged table.
  // STEP 3: Footer — record count + page indicator left, Prev/Next right.
  //          Both buttons always render, disabled at the edges
  //          (ui-rules.md), never hidden so the user can't lose the
  //          pagination shape.

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            className="h-10 pl-9"
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column, index) => (
                <TableHead key={index} className={column.headerClassName}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {isError ? (
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  <div
                    role="alert"
                    className="flex flex-col items-center gap-3 py-10 text-center"
                  >
                    <p className="text-sm text-muted-foreground">
                      {errorMessage}
                    </p>
                    <Button variant="outline" onClick={onRetry}>
                      Try again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : isPending && rows.length === 0 ? (
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  <div className="space-y-3 py-4">
                    {Array.from({ length: skeletonRows }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="size-9 animate-pulse rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : rows.length === 0 ? (
            <TableBody>
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    {empty}
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {rows.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((column, index) => (
                    <TableCell key={index} className={column.className}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {total} record{total === 1 ? "" : "s"} · Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-10"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            <ChevronLeft aria-hidden="true" />
            Prev
          </Button>
          <Button
            variant="outline"
            className="h-10"
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          >
            Next
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  )
}
