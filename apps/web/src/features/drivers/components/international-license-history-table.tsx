"use client"

import { ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { InternationalLicenseDto } from "@repo/shared"

function formatLicenseDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`))
}

function todayIso(): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${today.getFullYear()}-${month}-${day}`
}

function internationalStatusFor(license: InternationalLicenseDto): {
  label: string
  className: string
} {
  if (license.expirationDate < todayIso()) {
    return { label: "Expired", className: "bg-neutral-tint text-neutral-tint-foreground" }
  }
  return { label: "Active", className: "bg-success/10 text-success" }
}

interface InternationalLicenseHistoryTableProps {
  rows: InternationalLicenseDto[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

export function InternationalLicenseHistoryTable({
  rows,
  isPending,
  isError,
  onRetry,
}: InternationalLicenseHistoryTableProps) {
  const columns: DataTableColumn<InternationalLicenseDto>[] = [
    {
      header: "License",
      cell: (license) => (
        <span className="font-mono text-sm font-bold">INT-{license.id}</span>
      ),
    },
    {
      header: "Based On",
      cell: (license) => (
        <span className="font-mono text-sm">LIC-{license.issuedUsingLocalLicenseId}</span>
      ),
    },
    {
      header: "Issued",
      cell: (license) => (
        <span className="text-sm tabular-nums">{formatLicenseDate(license.issueDate)}</span>
      ),
    },
    {
      header: "Expires",
      cell: (license) => (
        <span className="text-sm tabular-nums">{formatLicenseDate(license.expirationDate)}</span>
      ),
    },
    {
      header: "Status",
      cell: (license) => {
        const status = internationalStatusFor(license)
        return <Badge className={status.className}>{status.label}</Badge>
      },
    },
  ]

  return (
    <DataTable<InternationalLicenseDto>
      header={
        <div>
          <h2 className="text-lg font-semibold">International License History</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All international licenses issued to this driver.
          </p>
        </div>
      }
      showSearch={false}
      searchValue=""
      onSearchChange={() => {}}
      searchPlaceholder=""
      searchLabel="Search international license history"
      columns={columns}
      rows={rows}
      getRowId={(license) => license.id}
      isPending={isPending}
      isError={isError}
      onRetry={onRetry}
      errorMessage="Could not load the international license history."
      empty={
        <>
          <ShieldCheck aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No international licenses on file</p>
          <p className="text-xs text-muted-foreground">
            International licenses issued for this driver appear here.
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
