"use client"

import { useQuery } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"

// usePeople — paginated + searchable citizen list backing the 1.2
// DataTable. The key carries the full filter (search/page/pageSize) so
// every distinct combination is cached separately (invariant #5). The
// 5-minute staleTime reflects that the registry changes rarely — every
// create/update/delete mutation invalidates these lists anyway.

export function usePeople(params: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: peopleKeys.list(params),
    queryFn: () =>
      personService.getPeople({
        search: params.search,
        page: params.page,
        pageSize: params.pageSize,
      }),
    // STEP 1: Registry data changes rarely (only via clerk CRUD, which
    //         invalidates) — a long staleTime avoids refetch churn while
    //         the user pages or types in the filter.
    staleTime: 5 * 60_000,
    // STEP 2: Keep the previous page's rows on screen while a new
    //         page/search resolves — the table never flashes empty.
    placeholderData: (previousData) => previousData,
  })
}