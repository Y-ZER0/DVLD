"use client"

import { IdCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { IssueReason, type LicenseRegisterRowDto } from "@repo/shared"

const REASON_LABELS: Record<IssueReason, string> = {
  [IssueReason.FIRST_TIME]: "First Time",
  [IssueReason.RENEW]: "Renewed",
  [IssueReason.REPLACEMENT_DAMAGED]: "Damaged",
  [IssueReason.REPLACEMENT_LOST]: "Lost",
}

function formatLicenseDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`))
}

function licenseStatusFor(license: LicenseRegisterRowDto): {
  label: string
  className: string
} {
  if (license.isDetained) {
    return { label: "Detained", className: "bg-destructive/10 text-destructive" }
  }
  if (!license.isActive) {
    return { label: "Inactive", className: "bg-neutral-tint text-neutral-tint-foreground" }
  }
  return { label: "Active", className: "bg-success/10 text-success" }
}

interface LocalLicenseHistoryTableProps {
  rows: LicenseRegisterRowDto[]
  isPending: boolean
  isError: boolean
  onRetry: () => void
}

export function LocalLicenseHistoryTable({
  rows,
  isPending,
  isError,
  onRetry,
}: LocalLicenseHistoryTableProps) {
  const columns: DataTableColumn<LicenseRegisterRowDto>[] = [
    {
      header: "License",
      cell: (license) => (
        <span className="font-mono text-sm font-bold">LIC-{license.id}</span>
      ),
    },
    {
      header: "Class",
      cell: (license) => <span className="text-sm">{license.className}</span>,
    },
    {
      header: "Issue Reason",
      cell: (license) => (
        <span className="text-sm">{REASON_LABELS[license.issueReason]}</span>
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
      header: "Fees",
      cell: (license) => (
        <span className="text-sm tabular-nums">${license.paidFees}</span>
      ),
    },
    {
      header: "Status",
      cell: (license) => {
        const status = licenseStatusFor(license)
        return <Badge className={status.className}>{status.label}</Badge>
      },
    },
  ]

  return (
    <DataTable<LicenseRegisterRowDto>
      header={
        <div>
          <h2 className="text-lg font-semibold">Local License History</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All local driving licenses issued to this driver.
          </p>
        </div>
      }
      showSearch={false}
      searchValue=""
      onSearchChange={() => {}}
      searchPlaceholder=""
      searchLabel="Search local license history"
      columns={columns}
      rows={rows}
      getRowId={(license) => license.id}
      isPending={isPending}
      isError={isError}
      onRetry={onRetry}
      errorMessage="Could not load the local license history."
      empty={
        <>
          <IdCard aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No local licenses on file</p>
          <p className="text-xs text-muted-foreground">
            Local licenses issued to this driver appear here.
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
