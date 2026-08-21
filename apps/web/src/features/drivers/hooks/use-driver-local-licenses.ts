"use client"

import { useQuery } from "@tanstack/react-query"
import { driverKeys } from "../driverKeys"
import { driversService } from "../services/drivers.service"

export function useDriverLocalLicenses(id: number | undefined) {
  return useQuery({
    queryKey: driverKeys.localLicenses(id as number),
    queryFn: () => driversService.getDriverLocalLicenses(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}
