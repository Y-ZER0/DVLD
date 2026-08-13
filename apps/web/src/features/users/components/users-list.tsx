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

// UsersList — the 2.2 system-accounts screen (ui-registry.md DataTable):
// owns the list's search + page state, the per-row status toggle, and the
// Update-Password / Delete dialog orchestration. The visual table is the
// shared DataTable fed with this feature's columns and query states.
// Status column = ToggleSwitch + StatusPill pair (ui-registry.md) — never
// the switch alone; the "(you)" tag marks the row belonging to the
// currently authenticated session (informative only, no self-row guard —
// Session 10 ARCHITECT decision).

const PAGE_SIZE = 10

export function UsersList() {
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

  const { data, isPending, isError, refetch } = useUsers({
    search: debouncedSearch || undefined,
    page,
    pageSize: PAGE_SIZE,
  })

  // STEP 3: The "(you)" tag compares against the signed-in session
  //         (Zustand selector per invariant #3 — never the whole store).
  const currentUsername = useAuthStore((state) => state.user?.username)

  const setUserStatus = useSetUserStatus()
  // STEP 4: One in-flight toggle at a time — track WHICH row is pending so
  //         only its switch disables (the mutation hook's global isPending
  //         can't tell rows apart).
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [resetUser, setResetUser] = useState<UserDto | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserDto | null>(null)

  const rows = data?.data ?? []
  const total = data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  // STEP 5: The Status cell — the interactive half of the pair. Waiting
  //         for the server (no optimistic flip, Session 10 decision): the
  //         switch disables while this row's mutation is in flight and
  //         the pill re-reads isActive on invalidation. A failed toggle
  //         must say so — without an optimistic flip the switch would
  //         silently snap back to the old value and the clerk would never
  //         know the request failed (REVIEW 2.2 finding).
  const [toggleError, setToggleError] = useState<string | null>(null)

  const handleToggle = (user: UserDto, nextActive: boolean) => {
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

  // STEP 6: Column definitions — the user-specific cell rendering handed
  //         to the shared DataTable. Built here (not module-level) because
  //         the Actions and Status cells close over the toggle handler and
  //         dialog setters.
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
        // STEP 7: ToggleSwitch + StatusPill pair (ui-registry.md) — color
        //         never alone (ui-rules.md): the pill's label carries the
        //         state, the switch carries the action.
        <div className="flex items-center gap-2.5">
          <Switch
            checked={user.isActive}
            disabled={togglingId === user.id}
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
    // STEP 8: Actions — IconActionButton pattern (ui-registry.md): 40×40
    //         hit target, gray Key (reset password), red Trash (delete).
    //         Right-aligned in both header and cells.
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

  // STEP 9: Empty state — two variants (ui-rules.md EmptyState, never a
  //         bare header row): a committed search that matches nothing vs.
  //         a system with zero accounts yet.
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
      {/* STEP 10: Toggle failure banner — the wait-for-server toggle gives
              no other feedback, so a rejected PATCH /users/:id/status must
              explain itself here (same role="alert" box as the modals). */}
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