"use client"

import { useQuery } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"

export function usePeople(params: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: peopleKeys.list(params),
    queryFn: () =>
      personService.getPeople({
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      }),
    staleTime: 5 * 60_000,
    placeholderData: (previousData) => previousData,
  })
}