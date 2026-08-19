"use client"

import { useQuery } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

export function useCitizenOptions() {
  return useQuery({
    queryKey: localLicenseApplicationKeys.citizenOptions(),
    queryFn: () => localLicenseApplicationsService.getCitizenOptions(),
    staleTime: 5 * 60_000,
  })
}