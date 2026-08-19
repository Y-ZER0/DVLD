"use client"

import { useQuery } from "@tanstack/react-query"
import { lookupService } from "../services/lookup.service"
import { lookupKeys } from "../lookupKeys"

export function useLicenseClasses() {
  return useQuery({
    queryKey: lookupKeys.licenseClasses(),
    queryFn: () => lookupService.getLicenseClasses(),
    staleTime: 5 * 60_000,
  })
}