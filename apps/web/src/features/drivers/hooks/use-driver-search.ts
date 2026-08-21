"use client"

import { useQuery } from "@tanstack/react-query"
import { driverKeys } from "../driverKeys"
import { driversService, type DriversSearchParams } from "../services/drivers.service"

export function useDriverSearch(params: DriversSearchParams) {
  return useQuery({
    queryKey: driverKeys.search(params),
    queryFn: () => driversService.searchDrivers(params),
    placeholderData: (previousData) => previousData,
    enabled: params.search.trim().length > 0,
  })
}
