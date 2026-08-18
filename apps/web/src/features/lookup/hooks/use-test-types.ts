"use client"

import { useQuery } from "@tanstack/react-query"
import { lookupService } from "../services/lookup.service"
import { lookupKeys } from "../lookupKeys"

// useTestTypes — full test-type register backing the 5.2 schedule modal's
// live fee notice (invariant #28: the fee shown for a NEW booking is the
// current TestTypes.TestTypeFees, never a stale snapshot) and any future
// consumer (Features 10-12). Lookup data changes rarely (Feature 11 PATCHes
// only) — the 5-minute staleTime mirrors useLicenseClasses/useApplicationTypes
// (library-docs.md § 4: lookups get 5*60_000, transactional data keeps the
// default 30s).

export function useTestTypes() {
  return useQuery({
    queryKey: lookupKeys.testTypes(),
    queryFn: () => lookupService.getTestTypes(),
    staleTime: 5 * 60_000,
  })
}