"use client"

import { useQuery } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

export function useLocalLicenseApplication(id: number | undefined) {
  return useQuery({
    queryKey: localLicenseApplicationKeys.detail(id as number),
    queryFn: () => localLicenseApplicationsService.getLocalLicenseApplication(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}