"use client"

import { useQuery } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import type { PersonDto } from "@repo/shared"

export function usePerson(id: number, initialData?: PersonDto) {
  return useQuery({
    queryKey: peopleKeys.detail(id),
    queryFn: () => personService.getPerson(id),
    initialData,
  })
}