"use client"

import { useQuery } from "@tanstack/react-query"
import { lookupService } from "../services/lookup.service"
import { lookupKeys } from "../lookupKeys"

export function useApplicationTypes() {
  return useQuery({
    queryKey: lookupKeys.applicationTypes(),
    queryFn: () => lookupService.getApplicationTypes(),
    staleTime: 5 * 60_000,
  })
}