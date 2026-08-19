"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"

export function useDeletePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => personService.deletePerson(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.removeQueries({ queryKey: peopleKeys.detail(id) })
    },
  })
}