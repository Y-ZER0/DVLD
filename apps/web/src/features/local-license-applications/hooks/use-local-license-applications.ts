"use client"

import { useQuery } from "@tanstack/react-query"
import type { ApplicationStatus } from "@repo/shared"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

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