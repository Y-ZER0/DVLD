"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CreateUserAccountModal } from "./components/create-user-account-modal"
import { UsersList } from "./components/users-list"

export function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Link system accounts to registered citizens, manage credentials and access.
          </p>
        </div>
        <Button className="h-10" onClick={() => setCreateOpen(true)}>
          <Plus aria-hidden="true" />
          Create User
        </Button>
      </div>

      <UsersList />

      <CreateUserAccountModal open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}