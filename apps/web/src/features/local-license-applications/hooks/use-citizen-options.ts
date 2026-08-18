"use client"

import { useQuery } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

// useCitizenOptions — the FULL citizen set feeding the 4.2 modal's
// "Select a citizen" combobox (ui-registry Combobox: pickers type-to-filter
// over the full option set, never a page window). People registry data
// changes rarely and only via clerk CRUD — 5-minute staleTime, same
// convention as usePeople (library-docs.md § 4).

export function useCitizenOptions() {
  return useQuery({
    queryKey: localLicenseApplicationKeys.citizenOptions(),
    queryFn: () => localLicenseApplicationsService.getCitizenOptions(),
    staleTime: 5 * 60_000,
  })
}