"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { usersKeys } from "../usersKeys"
import type { CreateUserRequestDto } from "../dtos/create-user-request.dto"

// useCreateUser — links an unlinked person to a new account, then
// refreshes every users list AND the unlinked-people feed (invariant #6).
// The second invalidation matters: the person just linked must vanish
// from the "Link to Person" combobox on its next open, and the account
// they just created could match ANY active list filter.

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service — hooks never
    //         touch apiClient directly (invariant #4).
    mutationFn: (dto: CreateUserRequestDto) => userService.createUser(dto),

    onSuccess: () => {
      // STEP 2: A new account could match any list view's filter —
      //         invalidate the whole lists() branch.
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() })
      // STEP 3: The linked person is no longer "unlinked" — the combobox
      //         feed must refetch or it would offer an account they
      //         already have (409 on submit).
      queryClient.invalidateQueries({ queryKey: usersKeys.unlinkedPeople() })
    },
  })
}