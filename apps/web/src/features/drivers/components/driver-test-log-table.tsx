"use client"

import { ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { DriverTestLogEntryDto } from "@repo/shared"

function formatAppointmentDate(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDateTime))
}

interface DriverTestLogTableProps {
  rows: DriverTestLogEntryDto[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

export function DriverTestLogTable({
  rows,
  isPending,
  isError,
  onRetry,
}: DriverTestLogTableProps) {
  const columns: DataTableColumn<DriverTestLogEntryDto>[] = [
    {
      header: "Test",
      cell: (entry) => (
        <span className="font-mono text-sm font-bold">TEST-{entry.testId}</span>
      ),
    },
    {
      header: "Stage",
      cell: (entry) => <span className="text-sm">{entry.testTypeTitle}</span>,
    },
    {
      header: "Date",
      cell: (entry) => (
        <span className="text-sm tabular-nums">{formatAppointmentDate(entry.appointmentDate)}</span>
      ),
    },
    {
      header: "Result",
      cell: (entry) =>
        entry.testResult ? (
          <Badge className="bg-success/10 text-success">Passed</Badge>
        ) : (
          <Badge className="bg-destructive/10 text-destructive">Failed</Badge>
        ),
    },
    {
      header: "Fees",
      cell: (entry) => <span className="text-sm tabular-nums">${entry.paidFees}</span>,
    },
    {
      header: "App",
      cell: (entry) => (
        <span className="font-mono text-sm">L-{entry.applicationId}</span>
      ),
    },
    {
      header: "Notes",
      cell: (entry) => (
        <span
          className="block max-w-[220px] truncate text-sm text-muted-foreground"
          title={entry.notes ?? undefined}
        >
          {entry.notes ?? "—"}
        </span>
      ),
    },
  ]

  return (
    <DataTable<DriverTestLogEntryDto>
      header={
        <div>
          <h2 className="text-lg font-semibold">Test Log</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every test this driver has taken, across every application, newest first.
          </p>
        </div>
      }
      showSearch={false}
      searchValue=""
      onSearchChange={() => {}}
      searchPlaceholder=""
      searchLabel="Search test log"
      columns={columns}
      rows={rows}
      getRowId={(entry) => entry.testId}
      isPending={isPending}
      isError={isError}
      onRetry={onRetry}
      errorMessage="Could not load the test log."
      empty={
        <>
          <ClipboardList aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No tests on file</p>
          <p className="text-xs text-muted-foreground">
            Test records for this driver appear here once appointments are completed.
          </p>
        </>
      }
      total={rows.length}
      page={1}
      totalPages={1}
      onPageChange={() => {}}
    />
  )
}
