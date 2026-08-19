"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"

export function useCancelApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => localLicenseApplicationsService.cancelApplication(id),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.detail(id) })
    },
  })
}