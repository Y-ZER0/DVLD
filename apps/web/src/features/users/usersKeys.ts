// usersKeys — TanStack Query key factory for the users feature
// (library-docs.md § 4: identical shape for every feature; never write a
// raw inline array in a useQuery call — invariant #5). The list key
// carries the whole filter so each distinct search/page combination caches
// separately. unlinkedPeople is a separate branch — the "Link to Person"
// combobox feed is a people-domain route (GET /people/unlinked) but it is
// consumed exclusively by the users feature, so its cache entry lives here
// and is invalidated by useCreateUser (a newly linked person must vanish
// from the picker).

export const usersKeys = {
  all: () => ["users"] as const,
  lists: () => [...usersKeys.all(), "list"] as const,
  list: (filter?: { search?: string; page?: number; pageSize?: number }) =>
    [...usersKeys.lists(), { filter }] as const,
  details: () => [...usersKeys.all(), "detail"] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
  unlinkedPeople: () => [...usersKeys.all(), "unlinked-people"] as const,
}