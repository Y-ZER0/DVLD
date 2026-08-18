"use client"

import { useQuery } from "@tanstack/react-query"
import type { ApplicationStatus } from "@repo/shared"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

// useLocalLicenseApplications — paginated + searchable application
// register backing the 4.2 DataTable. The key carries the full filter
// (search/status/page/pageSize) so every distinct combination caches
// separately (invariant #5). Applications are transactional data — the
// global 30s staleTime applies (library-docs.md § 4); creates/cancels
// invalidate these lists anyway. placeholderData keeps the previous page
// visible while a new filter resolves (PeopleList precedent).

export function useLocalLicenseApplications(params: {
  search?: string
  status?: ApplicationStatus
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: localLicenseApplicationKeys.list(params),
    queryFn: () =>
      localLicenseApplicationsService.getLocalLicenseApplications({
        search: params.search,
        status: params.status,
        page: params.page,
        pageSize: params.pageSize,
      }),
    placeholderData: (previousData) => previousData,
  })
}