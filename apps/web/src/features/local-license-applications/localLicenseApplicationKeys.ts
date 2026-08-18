// localLicenseApplicationKeys — TanStack Query key factory for the local
// driving license applications feature (library-docs.md § 4: identical
// shape for every feature; never write a raw inline array in a useQuery
// call — invariant #5). The list key carries the whole filter (search,
// status filter, page window) so each distinct combination caches
// separately; detail keys are per-application id. pipeline(id) hangs off
// the detail branch — the test pipeline (Feature 5.2) is a projection of
// exactly one application, and invalidating detail(id) alongside pipeline(id)
// keeps the two queries moving together. citizenOptions is a separate
// branch — the combobox feed is a people-domain route (GET /people) but
// consumed exclusively by this feature's modal, so its cache entry lives
// here (same precedent as usersKeys.unlinkedPeople).

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