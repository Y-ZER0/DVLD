"use client"

import { useQuery } from "@tanstack/react-query"
import { testingService } from "../services/testing.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

// useTestPipeline — the 5.2 pipeline query for the application detail
// screen's right-hand column (three ordered stages + appointment history).
// Disabled until an id actually exists (the route hands it in as a parsed
// number), same guard as useLocalLicenseApplication. Transactional data
// keeps the default 30s staleTime; schedule/record-result mutations
// invalidate this exact key on success so the stepper re-derives state
// from server truth (invariant #6 — never hand-patched).

export function useTestPipeline(id: number | undefined) {
  return useQuery({
    queryKey: localLicenseApplicationKeys.pipeline(id as number),
    queryFn: () => testingService.getTestPipeline(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}