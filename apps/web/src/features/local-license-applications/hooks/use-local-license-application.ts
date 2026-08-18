"use client"

import { useQuery } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

// useLocalLicenseApplication — single-application query for the 4.2
// detail screen. Disabled until an id actually exists (the route hands it
// in as a parsed number). Transactional data keeps the default 30s
// staleTime; useCancelApplication invalidates this exact key on success so
// the detail re-renders the new Cancelled status.

export function useLocalLicenseApplication(id: number | undefined) {
  return useQuery({
    queryKey: localLicenseApplicationKeys.detail(id as number),
    queryFn: () => localLicenseApplicationsService.getLocalLicenseApplication(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}