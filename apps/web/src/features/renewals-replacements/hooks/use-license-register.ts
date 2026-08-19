"use client"

import { useQuery } from "@tanstack/react-query"
import { licensesService, type LicenseRegisterParams } from "../services/licenses.service"
import { renewalsReplacementKeys } from "../renewalsReplacementKeys"

export function useLicenseRegister(params: LicenseRegisterParams) {
  return useQuery({
    queryKey: renewalsReplacementKeys.list(params),
    queryFn: () => licensesService.getLicenseRegister(params),
    placeholderData: (previousData) => previousData,
  })
}