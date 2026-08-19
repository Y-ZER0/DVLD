export const peopleKeys = {
  all: () => ["people"] as const,
  lists: () => [...peopleKeys.all(), "list"] as const,
  list: (filter?: { search?: string; page?: number; pageSize?: number }) =>
    [...peopleKeys.lists(), { filter }] as const,
  details: () => [...peopleKeys.all(), "detail"] as const,
  detail: (id: number) => [...peopleKeys.details(), id] as const,
}