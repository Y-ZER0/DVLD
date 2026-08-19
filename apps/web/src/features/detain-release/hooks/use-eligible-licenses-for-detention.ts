"use client"

import { useQuery } from "@tanstack/react-query"
import { detainReleaseService } from "../services/detain-release.service"
import { detainReleaseKeys } from "../detainReleaseKeys"

export function useEligibleLicensesForDetention() {
  return useQuery({
    queryKey: detainReleaseKeys.eligibleLicenses(),
    queryFn: () => detainReleaseService.getEligibleLicenses(),
    staleTime: 5 * 60_000,
  })
}