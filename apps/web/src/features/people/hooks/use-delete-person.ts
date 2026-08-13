"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"

// useDeletePerson — permanently removes a citizen and refreshes every
// people list + the deleted detail query. The backend answers 409 when the
// person has linked records (a User today, Drivers later) — that message
// surfaces verbatim in the confirmation dialog.

export function useDeletePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => personService.deletePerson(id),

    // STEP 1: The deleted row is gone from every possible list view and
    //         its detail query can no longer resolve — clear both.
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.removeQueries({ queryKey: peopleKeys.detail(id) })
    },
  })
}