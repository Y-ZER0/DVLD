"use client"

import { useQuery } from "@tanstack/react-query"
import { internationalLicensesService } from "../services/international-licenses.service"
import { internationalLicensesKeys } from "../internationalLicensesKeys"

export function useEligibleInternationalDrivers() {
  return useQuery({
    queryKey: internationalLicensesKeys.eligibleDrivers(),
    queryFn: () => internationalLicensesService.getEligibleDrivers(),
    staleTime: 5 * 60_000,
  })
}