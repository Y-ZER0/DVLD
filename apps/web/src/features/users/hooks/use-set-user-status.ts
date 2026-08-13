"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"

// useSetUserStatus — toggles an account's IsActive (PATCH
// /users/:id/status), then refreshes the lists so the Status column's
// ToggleSwitch + StatusPill re-read server truth. NOT optimistic (Session
// 10 ARCHITECT decision): the switch disables while pending and the row
// flips on invalidation — consistent with every other mutation in the app.

export function useSetUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service (invariant #4).
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      userService.setStatus(id, isActive),

    // STEP 2: The flipped row lives in every list view — the whole
    //         lists() branch is stale until the server confirms.
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.id) })
    },
  })
}