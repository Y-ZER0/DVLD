"use client"

import { useQuery } from "@tanstack/react-query"
import { driverKeys } from "../driverKeys"
import { driversService } from "../services/drivers.service"

export function useDriverInternationalLicenses(id: number | undefined) {
  return useQuery({
    queryKey: driverKeys.internationalLicenses(id as number),
    queryFn: () => driversService.getDriverInternationalLicenses(id as number),
    enabled: id !== undefined && !Number.isNaN(id),
  })
}
