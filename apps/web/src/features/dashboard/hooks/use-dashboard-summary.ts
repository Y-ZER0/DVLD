"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardKeys } from "../dashboardKeys"
import { getDashboardSummary } from "../services/dashboard.service"

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
    staleTime: 30_000,
  })
}
