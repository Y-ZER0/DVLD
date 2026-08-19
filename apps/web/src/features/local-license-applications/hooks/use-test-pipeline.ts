"use client"

import { useQuery } from "@tanstack/react-query"
import { testingService } from "../services/testing.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

export function useTestPipeline(id: number | undefined) {
  return useQuery({
    queryKey: localLicenseApplicationKeys.pipeline(id as number),
    queryFn: () => testingService.getTestPipeline(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}