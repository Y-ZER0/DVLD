export const internationalLicensesKeys = {
  all: () => ["international-licenses"] as const,
  lists: () => [...internationalLicensesKeys.all(), "list"] as const,
  list: (params?: { page?: number; pageSize?: number }) =>
    [...internationalLicensesKeys.lists(), { params }] as const,
  eligibleDrivers: () => [...internationalLicensesKeys.all(), "eligible-drivers"] as const,
}