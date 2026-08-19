"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import type { CreatePersonRequestDto } from "../dtos/create-person-request.dto"

export function useCreatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreatePersonRequestDto) => personService.createPerson(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
    },
  })
}