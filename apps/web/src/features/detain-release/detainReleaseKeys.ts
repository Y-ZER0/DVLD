export const detainReleaseKeys = {
  all: () => ["detain-release"] as const,
  lists: () => [...detainReleaseKeys.all(), "list"] as const,
  list: (params?: { page?: number; pageSize?: number }) =>
    [...detainReleaseKeys.lists(), { params }] as const,
  eligibleLicenses: () => [...detainReleaseKeys.all(), "eligible-licenses"] as const,
}