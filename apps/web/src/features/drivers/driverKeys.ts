export const driverKeys = {
  all: () => ["drivers"] as const,
  lists: () => [...driverKeys.all(), "list"] as const,
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    [...driverKeys.lists(), { params }] as const,
  search: (params?: { search: string; page?: number; pageSize?: number }) =>
    [...driverKeys.all(), "search", { params }] as const,
  details: () => [...driverKeys.all(), "detail"] as const,
  summary: (id: number) => [...driverKeys.details(), id, "summary"] as const,
  localLicenses: (id: number) => [...driverKeys.details(), id, "local-licenses"] as const,
  internationalLicenses: (id: number) =>
    [...driverKeys.details(), id, "international-licenses"] as const,
  testLog: (id: number) => [...driverKeys.details(), id, "test-log"] as const,
}
