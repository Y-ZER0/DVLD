"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { InternationalLicenseDto } from "@repo/shared"
import { useInternationalLicenses } from "../hooks/use-international-licenses"

const PAGE_SIZE = 10

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

export function InternationalLicensesTable() {
  const [page, setPage] = useState(1)

  const { data, isPending, isError, refetch } = useInternationalLicenses({
    page,
    pageSize: PAGE_SIZE,
  })

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const columns: DataTableColumn<InternationalLicenseDto>[] = [
    {
      header: "License",
      cell: (license) => (
        <span className="font-mono text-sm font-bold">INT-{license.id}</span>
      ),
    },
    {
      header: "Driver",
      cell: (license) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{license.driverName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {license.nationalNumber}
          </p>
        </div>
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
        <span className="text-sm tabular-nums">
          {formatLicenseDate(license.expirationDate)}
        </span>
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
          <h2 className="text-lg font-semibold">Issued International Licenses</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            All international licenses on record, newest first.
          </p>
        </div>
      }
      showSearch={false}
      searchValue=""
      onSearchChange={() => {}}
      searchPlaceholder=""
      searchLabel="Search international licenses"
      columns={columns}
      rows={rows}
      getRowId={(license) => license.id}
      isPending={isPending}
      isError={isError}
      onRetry={refetch}
      errorMessage="Could not load the international license register."
      empty={
        <>
          <ShieldCheck aria-hidden="true" className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">No international licenses issued yet</p>
          <p className="text-xs text-muted-foreground">
            International licenses issued for drivers with an active Car license appear here.
          </p>
        </>
      }
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  )
}