"use client"

import { useQuery } from "@tanstack/react-query"
import { lookupService } from "../services/lookup.service"
import { lookupKeys } from "../lookupKeys"

export function useTestTypes() {
  return useQuery({
    queryKey: lookupKeys.testTypes(),
    queryFn: () => lookupService.getTestTypes(),
    staleTime: 5 * 60_000,
  })
}