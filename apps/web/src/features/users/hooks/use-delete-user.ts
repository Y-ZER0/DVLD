"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

// useDeleteUser — permanently removes an account (DELETE /users/:id) and
// refreshes every users list. The backend 409s when the account is
// referenced by other records (Applications, Drivers, ...) — that message
// surfaces verbatim in the confirmation dialog, which stays open (Session
// 10 pattern: same as DeletePersonDialog's 409 stay-open).

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service (invariant #4).
    mutationFn: (id: number) => userService.deleteUser(id),

    // STEP 2: The deleted row is gone from every possible list view and
    //         its detail query can no longer resolve — clear both.
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) })
    },
  })
}