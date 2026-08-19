"use client"

import { useQuery } from "@tanstack/react-query"
import {
  internationalLicensesService,
  type InternationalLicensesParams,
} from "../services/international-licenses.service"
import { internationalLicensesKeys } from "../internationalLicensesKeys"

export function useInternationalLicenses(params: InternationalLicensesParams) {
  return useQuery({
    queryKey: internationalLicensesKeys.list(params),
    queryFn: () => internationalLicensesService.getInternationalLicenses(params),
    placeholderData: (previousData) => previousData,
  })
}