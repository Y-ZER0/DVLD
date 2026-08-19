"use client"

import { useState } from "react"
import { Gavel, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import type { DetentionRegisterRowDto } from "@repo/shared"
import { useDetentionRegister } from "../hooks/use-detention-register"
import { ReleaseDetentionModal } from "./Modals/release-detention-modal"

const PAGE_SIZE = 10

function formatDetainDate(isoDateTime: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDateTime))
}

function detentionStatusFor(detention: DetentionRegisterRowDto): {
  label: string
  className: string
} {
  if (detention.isReleased) {
    return { label: "Released", className: "bg-neutral-tint text-neutral-tint-foreground" }
  }
  return { label: "Detained", className: "bg-destructive/10 text-destructive" }
}

export function DetentionRegisterTable() {
  const [page, setPage] = useState(1)
  const [pendingRelease, setPendingRelease] = useState<DetentionRegisterRowDto | null>(null)

  const { data, isPending, isError, refetch } = useDetentionRegister({
    page,
    pageSize: PAGE_SIZE,
  })

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const closePendingRelease = (open: boolean) => {
    if (!open) setPendingRelease(null)
  }

  const columns: DataTableColumn<DetentionRegisterRowDto>[] = [
    {
      header: "Detain",
      cell: (detention) => (
        <span className="font-mono text-sm font-bold">#{detention.id}</span>
      ),
    },
    {
      header: "Driver",
      cell: (detention) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{detention.driverName}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {detention.nationalNumber}
          </p>
        </div>
      ),
    },
    {
      header: "License",
      cell: (detention) => (
        <span className="font-mono text-sm font-bold">LIC-{detention.licenseId}</span>
      ),
    },
    {
      header: "Detained",
      cell: (detention) => (
        <span className="text-sm tabular-nums">{formatDetainDate(detention.detainDate)}</span>
      ),
    },
    {
      header: "Fine",
      cell: (detention) => (
        <span className="text-sm tabular-nums">${detention.fineFees}</span>
      ),
    },
    {
      header: "Total due",
      cell: (detention) => (
        <span className="text-sm font-bold tabular-nums">${detention.totalDue}</span>
      ),
    },
    {
      header: "Status",
      cell: (detention) => {
        const status = detentionStatusFor(detention)
        return <Badge className={status.className}>{status.label}</Badge>
      },
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (detention) => (
        <Button
          variant="outline"
          className="h-10 bg-card disabled:cursor-not-allowed [&:disabled]:pointer-events-auto"
          disabled={detention.isReleased}
          title={detention.isReleased ? "This license was already released." : undefined}
          onClick={() => setPendingRelease(detention)}
        >
          <Unlock aria-hidden="true" />
          Release
        </Button>
      ),
    },
  ]

  return (
    <>
      <DataTable<DetentionRegisterRowDto>
        header={
          <div>
            <h2 className="text-lg font-semibold">Detention register</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              All detentions on record, newest first.
            </p>
          </div>
        }
        showSearch={false}
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder=""
        searchLabel="Search the detention register"
        columns={columns}
        rows={rows}
        getRowId={(detention) => detention.id}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        errorMessage="Could not load the detention register."
        empty={
          <>
            <Gavel aria-hidden="true" className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No detentions on record</p>
            <p className="text-xs text-muted-foreground">
              Detained licenses from the form on the left appear here.
            </p>
          </>
        }
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {pendingRelease && (
        <ReleaseDetentionModal
          detention={pendingRelease}
          open
          onOpenChange={closePendingRelease}
        />
      )}
    </>
  )
}