export const usersKeys = {
  all: () => ["users"] as const,
  lists: () => [...usersKeys.all(), "list"] as const,
  list: (filter?: { search?: string; page?: number; pageSize?: number }) =>
    [...usersKeys.lists(), { filter }] as const,
  details: () => [...usersKeys.all(), "detail"] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
  unlinkedPeople: () => [...usersKeys.all(), "unlinked-people"] as const,
}