"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import type { UpdatePersonRequestDto } from "../update-person-request.dto"

// useUpdatePerson — edits an existing citizen and refreshes both the list
// branch (the row's display values changed) and that citizen's detail
// query (invariant #6).

export function useUpdatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePersonRequestDto }) =>
      personService.updatePerson(id, dto),

    // STEP 1: Lists are stale because the row's rendered values (name,
    //         contact, etc.) just changed; the detail query is stale
    //         because the edit modal seeds from it on next open.
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(variables.id) })
    },
  })
}