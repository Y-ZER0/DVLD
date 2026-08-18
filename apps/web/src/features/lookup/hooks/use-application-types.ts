"use client"

import { useQuery } from "@tanstack/react-query"
import { lookupService } from "../services/lookup.service"
import { lookupKeys } from "../lookupKeys"

// useApplicationTypes — full application-type register. The 4.2 modal
// reads the NewDrivingLicense row's ApplicationFees from here for its fee
// notice (invariant #28: fees come from the lookups, never hardcoded);
// Features 7-9 read their own kinds the same way. Same 5-minute staleTime
// convention as useLicenseClasses.

export function useApplicationTypes() {
  return useQuery({
    queryKey: lookupKeys.applicationTypes(),
    queryFn: () => lookupService.getApplicationTypes(),
    staleTime: 5 * 60_000,
  })
}