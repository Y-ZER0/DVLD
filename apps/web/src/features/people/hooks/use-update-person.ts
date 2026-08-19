"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import type { UpdatePersonRequestDto } from "../dtos/update-person-request.dto"

export function useUpdatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdatePersonRequestDto }) =>
      personService.updatePerson(id, dto),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(variables.id) })
    },
  })
}