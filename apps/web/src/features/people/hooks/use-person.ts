"use client"

import { useQuery } from "@tanstack/react-query"
import { personService } from "../services/person.service"
import { peopleKeys } from "../peopleKeys"
import type { PersonDto } from "@repo/shared"

// usePerson — single citizen record for the Edit modal. Accepts the
// already-loaded table row as initialData so the form renders instantly;
// the query still refetches in the background and the modal's values are
// the server's latest once it resolves.

export function usePerson(id: number, initialData?: PersonDto) {
  return useQuery({
    queryKey: peopleKeys.detail(id),
    queryFn: () => personService.getPerson(id),
    // STEP 1: Seed the cache with the row the list already holds — the
    //         Edit form opens pre-populated with zero loading flash, and
    //         a background refetch keeps it server-fresh.
    initialData,
  })
}