"use client"

import { useEffect, useState } from "react"
import { CircleAlert, Key, SearchX, Trash2, UserCog } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DataTable, type DataTableColumn } from "@/components/data-table"
import { getApiErrorMessage } from "@/shared/lib/api-errors"
import { useAuthStore } from "@/shared/stores/auth.store"
import type { UserDto } from "@repo/shared"
import { useUsers } from "../hooks/use-users"
import { useSetUserStatus } from "../hooks/use-set-user-status"
import { UpdatePasswordModal } from "./update-password-modal"
import { DeleteUserDialog } from "./delete-user-dialog"

const PAGE_SIZE = 10

export function UsersList() {
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

  const { data, isPending, isError, refetch } = useUsers({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  const currentUsername = useAuthStore((state) => state.user?.username)

  const setUserStatus = useSetUserStatus()
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [resetUser, setResetUser] = useState<UserDto | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserDto | null>(null)

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const [toggleError, setToggleError] = useState<string | null>(null)

  const handleToggle = (user: UserDto, nextActive: boolean) => {
    if (user.username === currentUsername) return
    if (togglingId !== null) return
    setToggleError(null)
    setTogglingId(user.id)
    setUserStatus.mutate(
      { id: user.id, isActive: nextActive },
      {
        onError: (error) =>
          setToggleError(
            getApiErrorMessage(error, "Could not update the account status. Try again."),
          ),
        onSettled: () => setTogglingId(null),
      },
    )
  }

  const columns: DataTableColumn<UserDto>[] = [
    {
      header: "Username",
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-medium">{user.username}</p>
          {user.username === currentUsername && (
            <span className="shrink-0 text-xs text-muted-foreground">(you)</span>
          )}
        </div>
      ),
    },
    {
      header: "Linked Person",
      cell: (user) => <span className="text-sm">{user.personName}</span>,
    },
    {
      header: "National No.",
      cell: (user) => <span className="font-mono text-sm">{user.nationalNumber}</span>,
    },
    {
      header: "Status",
      cell: (user) => (
        <div className="flex items-center gap-2.5">
          <Switch
            checked={user.isActive}
            disabled={togglingId === user.id || user.username === currentUsername}
            aria-label={`${user.isActive ? "Deactivate" : "Activate"} account ${user.username}`}
            onCheckedChange={(checked) => handleToggle(user, checked)}
          />
          <Badge
            className={
              user.isActive
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }
          >
            {user.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-muted-foreground"
            aria-label={`Update password for ${user.username}`}
            onClick={() => setResetUser(user)}
          >
            <Key aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-destructive hover:text-destructive"
            aria-label={`Delete account ${user.username}`}
            onClick={() => setDeleteUser(user)}
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
      <p className="text-sm font-medium">No accounts match "{debouncedSearch}"</p>
      <p className="text-xs text-muted-foreground">
        Try a different username, name, or national number.
      </p>
    </>
  ) : (
    <>
      <UserCog aria-hidden="true" className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">No user accounts yet</p>
      <p className="text-xs text-muted-foreground">
        Use "Create User" to link the first citizen to an account.
      </p>
    </>
  )

  return (
    <>
      {toggleError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0">{toggleError}</span>
        </div>
      )}

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(user) => user.id}
        isPending={isPending}
        isError={isError}
        onRetry={refetch}
        errorMessage="Could not load the user accounts."
        empty={emptyState}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Filter by username, name, national number..."
        searchLabel="Filter users"
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {resetUser && (
        <UpdatePasswordModal
          user={resetUser}
          open={true}
          onOpenChange={(open) => {
            if (!open) setResetUser(null)
          }}
        />
      )}

      <DeleteUserDialog user={deleteUser} onOpenChange={() => setDeleteUser(null)} />
    </>
  )
}