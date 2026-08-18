"use client"

import { useQuery } from "@tanstack/react-query"
import { lookupService } from "../services/lookup.service"
import { lookupKeys } from "../lookupKeys"

// useLicenseClasses — full license-class register backing the 4.2 modal's
// class select (option label embeds the class minimum age) and any future
// picker (Features 7-9). Lookup data changes rarely (Feature 11 PATCHes
// only) — the 5-minute staleTime mirrors usePeople's convention
// (library-docs.md § 4: lookups get 5*60_000, transactional data keeps the
// default 30s).

export function useLicenseClasses() {
  return useQuery({
    queryKey: lookupKeys.licenseClasses(),
    queryFn: () => lookupService.getLicenseClasses(),
    staleTime: 5 * 60_000,
  })
}