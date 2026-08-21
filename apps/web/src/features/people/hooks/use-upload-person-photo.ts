"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"

export function useUploadPersonPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => personService.uploadPersonPhoto(id, file),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(variables.id) })
    },
  })
}

export function useRemovePersonPhoto() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => personService.removePersonPhoto(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: peopleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: peopleKeys.detail(id) })
    },
  })
}
