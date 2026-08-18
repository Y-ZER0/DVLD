"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"
import type { UpdateUserPasswordRequestDto } from "../dtos/update-user-password-request.dto"

// useUpdateUserPassword — resets an account's password (PATCH
// /users/:id/password). No list field displays the password, so nothing
// in the visible UI goes stale; the detail cache is invalidated anyway
// (invariant #6) so a future screen seeded from it never shows an old row.

export function useUpdateUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service (invariant #4).
    mutationFn: ({ id, dto }: { id: number; dto: UpdateUserPasswordRequestDto }) =>
      userService.updatePassword(id, dto),

    // STEP 2: Password change affects no visible list cell, but the
    //         account row did change server-side — keep the detail cache
    //         honest for anything seeded from it later.
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) })
    },
  })
}