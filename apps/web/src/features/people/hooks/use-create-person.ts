"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import type { CreatePersonRequestDto } from "../create-person-request.dto"

// useCreatePerson — registers a new citizen, then refreshes every people
// list (invariant #6: every mutation invalidates on success).

export function useCreatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    // STEP 1: The HTTP call is delegated to the service — hooks never
    //         touch apiClient directly (invariant #4).
    mutationFn: (dto: CreatePersonRequestDto) => personService.createPerson(dto),

    // STEP 2: A new citizen could match ANY active list filter, so the
    //         whole lists() branch is stale — invalidate it all rather
    //         than trying to guess which page/search is affected.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
    },
  })
}