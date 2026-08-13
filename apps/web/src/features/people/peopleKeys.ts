// peopleKeys — TanStack Query key factory for the people feature
// (library-docs.md § 4: identical shape for every feature; never write a
// raw inline array in a useQuery call — invariant #5). The list key
// carries the whole filter so each distinct search/page combination caches
// separately; detail keys are per citizen id.

export const peopleKeys = {
  all: () => ["people"] as const,
  lists: () => [...peopleKeys.all(), "list"] as const,
  list: (filter?: { search?: string; page?: number; pageSize?: number }) =>
    [...peopleKeys.lists(), { filter }] as const,
  details: () => [...peopleKeys.all(), "detail"] as const,
  detail: (id: number) => [...peopleKeys.details(), id] as const,
}