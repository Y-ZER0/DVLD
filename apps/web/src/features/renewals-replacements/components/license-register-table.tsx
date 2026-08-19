"use client"

import { useState } from "react"
import { FileWarning, FileX, IdCard, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { IssueReason, type LicenseRegisterRowDto } from "@repo/shared"
import { useLicenseRegister } from "../hooks/use-license-register"
import { RenewLicenseModal } from "./Modals/renew-license-modal"
import { ReplaceLicenseModal } from "./Modals/replace-license-modal"

const PAGE_SIZE = 10

const REASON_LABELS: Record<IssueReason, string> = {
  [IssueReason.FIRST_TIME]: "First Time",
  [IssueReason.RENEW]: "Renewed",
  [IssueReason.REPLACEMENT_DAMAGED]: "Damaged",
  [IssueReason.REPLACEMENT_LOST]: "Lost",
}

const DETAINED_ACTION_TITLE = "Release this license before renewing or replacing it"
const INACTIVE_ACTION_TITLE = "This license is no longer active."

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

interface LicenseRegisterAction {
  license: LicenseRegisterRowDto
  action: "renew" | "damaged" | "lost"
}

export function LicenseRegisterTable() {
  const [page, setPage] = useState(1)
  const [pendingAction, setPendingAction] = useState<LicenseRegisterAction | null>(null)

  const { data, isPending, isError, refetch } = useLicenseRegister({
    page,
    pageSize: PAGE_SIZE,
  })

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const closePendingAction = (open: boolean) => {
    if (!open) setPendingAction(null)
  }

  const actionButtonsFor = (license: LicenseRegisterRowDto) => {
    const blocked = license.isDetained || !license.isActive
    const blockTitle = license.isDetained ? DETAINED_ACTION_TITLE : INACTIVE_ACTION_TITLE

    const renew = () => setPendingAction({ license, action: "renew" })
    const replaceDamaged = () => setPendingAction({ license, action: "damaged" })
    const replaceLost = () => setPendingAction({ license, action: "lost" })

    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="outline"
          size="icon"
          className="size-10 disabled:cursor-not-allowed [&:disabled]:pointer-events-auto"
          aria-label="Renew license"
          title={blocked ? blockTitle : undefined}
          disabled={blocked}
          onClick={renew}
        >
          <RefreshCw aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 disabled:cursor-not-allowed [&:disabled]:pointer-events-auto"
          aria-label="Replace damaged license"
          title={blocked ? blockTitle : undefined}
          disabled={blocked}
          onClick={replaceDamaged}
        >
          <FileWarning aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-10 disabled:cursor-not-allowed [&:disabled]:pointer-events-auto"
          aria-label="Replace lost license"
          title={blocked ? blockTitle : undefined}
          disabled={blocked}
          onClick={replaceLost}
        >
          <FileX aria-hidden="true" />
        </Button>
      </div>
    )
  }

  const columns: DataTableColumn<LicenseRegisterRowDto>[] = [
    {
      header: "License",
      cell: (license) => (
        <span className="font-mono text-sm font-bold">LIC-{license.id}</span>
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
      header: "Class",
      cell: (license) => <span className="text-sm">{license.className}</span>,
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
      header: "Reason",
      cell: (license) => (
        <span className="text-sm">{REASON_LABELS[license.issueReason]}</span>
      ),
    },
    {
      header: "Status",
      cell: (license) => {
        const status = licenseStatusFor(license)
        return <Badge className={status.className}>{status.label}</Badge>
      },
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: actionButtonsFor,
    },
  ]

  return (
    <>
      <DataTable<LicenseRegisterRowDto>
        header={<h2 className="text-lg font-semibold">Local license register</h2>}
        showSearch={false}
        searchValue=""
        onSearchChange={() => {}}
        searchPlaceholder=""
        searchLabel="Search the license register"
        columns={columns}
        rows={rows}
        getRowId={(license) => license.id}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        errorMessage="Could not load the license register."
        empty={
          <>
            <IdCard aria-hidden="true" className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">No local licenses on file yet</p>
            <p className="text-xs text-muted-foreground">
              Licenses issued through the application pipeline appear here.
            </p>
          </>
        }
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {pendingAction?.action === "renew" && (
        <RenewLicenseModal
          license={pendingAction.license}
          open
          onOpenChange={closePendingAction}
        />
      )}
      {pendingAction && pendingAction.action !== "renew" && (
        <ReplaceLicenseModal
          license={pendingAction.license}
          reason={pendingAction.action}
          open
          onOpenChange={closePendingAction}
        />
      )}
    </>
  )
}