"use client"

import { useQuery } from "@tanstack/react-query"
import { driverKeys } from "../driverKeys"
import { driversService } from "../services/drivers.service"

export function useDriverTestLog(id: number | undefined) {
  return useQuery({
    queryKey: driverKeys.testLog(id as number),
    queryFn: () => driversService.getDriverTestLog(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}
