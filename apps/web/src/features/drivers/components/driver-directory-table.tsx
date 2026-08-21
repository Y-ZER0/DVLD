"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Car } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { DriverDirectoryRowDto } from "@repo/shared"
import { useDrivers } from "../hooks/use-drivers"
import { useDriverSearch } from "../hooks/use-driver-search"

const PAGE_SIZE = 10

interface DriverDirectoryTableProps {
  searchTerm: string
  onClearSearch: () => void
}

export function DriverDirectoryTable({ searchTerm, onClearSearch }: DriverDirectoryTableProps) {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const isSearching = searchTerm.trim().length > 0

  useEffect(() => {
    setPage(1)
  }, [searchTerm])

  const directoryQuery = useDrivers({ page, pageSize: PAGE_SIZE })
  const searchQuery = useDriverSearch({ search: searchTerm, page, pageSize: PAGE_SIZE })

  const activeQuery = isSearching ? searchQuery : directoryQuery
  const rows = activeQuery.data?.data ?? []
  const total = activeQuery.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const { isPending, isError, refetch } = activeQuery

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const handleClear = () => {
    setPage(1)
    onClearSearch()
  }

  const columns: DataTableColumn<DriverDirectoryRowDto>[] = [
    {
      header: "Driver ID",
      cell: (driver) => (
        <span className="font-mono text-sm font-bold">DRV-{driver.driverId}</span>
      ),
    },
    {
      header: "Name",
      cell: (driver) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{driver.fullName}</p>
          <p className="truncate text-xs text-muted-foreground" title={driver.email}>
            {driver.email}
          </p>
        </div>
      ),
    },
    {
      header: "National Number",
      cell: (driver) => (
        <span className="font-mono text-sm">{driver.nationalNumber}</span>
      ),
    },
    {
      header: "Licenses",
      cell: (driver) => (
        <span className="text-sm tabular-nums">
          {driver.activeLicenseCount} active / {driver.totalLicenseCount} total
        </span>
      ),
    },
    {
      header: "Status",
      cell: (driver) =>
        driver.hasDetainedLicense ? (
          <Badge className="bg-destructive/10 text-destructive">Has Detained License</Badge>
        ) : (
          <Badge className="bg-success/10 text-success">In Good Standing</Badge>
        ),
    },
    {
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (driver) => (
        <Button
          variant="outline"
          className="h-10 bg-card"
          onClick={() => router.push(`/drivers/${driver.driverId}`)}
        >
          View History
        </Button>
      ),
    },
  ]

  return (
    <DataTable<DriverDirectoryRowDto>
      header={
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Registered Drivers</h2>
          <p className="text-sm text-muted-foreground">
            {isSearching ? (
              <>
                Showing results for <span className="font-medium text-foreground">&ldquo;{searchTerm}&rdquo;</span>
                {" · "}
                <button
                  type="button"
                  onClick={handleClear}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              </>
            ) : (
              "All drivers on record. Select one to open their full history."
            )}
          </p>
        </div>
      }
      showSearch={false}
      searchValue=""
      onSearchChange={() => {}}
      searchPlaceholder=""
      searchLabel="Search registered drivers"
      columns={columns}
      rows={rows}
      getRowId={(driver) => driver.driverId}
      isPending={isPending}
      isError={isError}
      onRetry={() => refetch()}
      errorMessage="Could not load the driver directory."
      empty={
        isSearching ? (
          <>
            <Car aria-hidden="true" className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No drivers match &ldquo;{searchTerm}&rdquo;</p>
            <p className="text-xs text-muted-foreground">Try a different National ID, Driver ID, or name.</p>
            <Button variant="outline" size="sm" onClick={handleClear} className="mt-1">
              Clear search
            </Button>
          </>
        ) : (
          <>
            <Car aria-hidden="true" className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No drivers on record yet</p>
            <p className="text-xs text-muted-foreground">
              Drivers are created automatically when their first license is issued.
            </p>
          </>
        )
      }
      total={total}
      page={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  )
}
