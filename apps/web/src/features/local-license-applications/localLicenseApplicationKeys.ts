import type { ApplicationStatus } from "@repo/shared"

export const localLicenseApplicationKeys = {
  all: () => ["local-license-applications"] as const,
  lists: () => [...localLicenseApplicationKeys.all(), "list"] as const,
  list: (filter?: {
    search?: string
    status?: ApplicationStatus
    page?: number
    pageSize?: number
  }) => [...localLicenseApplicationKeys.lists(), { filter }] as const,
  details: () => [...localLicenseApplicationKeys.all(), "detail"] as const,
  detail: (id: number) => [...localLicenseApplicationKeys.details(), id] as const,
  pipeline: (id: number) => [...localLicenseApplicationKeys.details(), id, "pipeline"] as const,
  citizenOptions: () => [...localLicenseApplicationKeys.all(), "citizen-options"] as const,
}