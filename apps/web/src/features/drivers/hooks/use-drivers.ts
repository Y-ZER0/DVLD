"use client"

import { useQuery } from "@tanstack/react-query"
import { driverKeys } from "../driverKeys"
import { driversService, type DriversDirectoryParams } from "../services/drivers.service"

export function useDrivers(params: DriversDirectoryParams) {
  return useQuery({
    queryKey: driverKeys.list(params),
    queryFn: () => driversService.getDrivers(params),
    placeholderData: (previousData) => previousData,
  })
}
