"use client"

import { useQuery } from "@tanstack/react-query"
import { driverKeys } from "../driverKeys"
import { driversService } from "../services/drivers.service"

export function useDriverSummary(id: number | undefined) {
  return useQuery({
    queryKey: driverKeys.summary(id as number),
    queryFn: () => driversService.getDriverSummary(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}
