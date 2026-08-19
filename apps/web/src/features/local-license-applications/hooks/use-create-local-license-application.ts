"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { CreateLocalLicenseApplicationRequestDto } from "../create-local-license-application-request.dto"

export function useCreateLocalLicenseApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateLocalLicenseApplicationRequestDto) =>
      localLicenseApplicationsService.createLocalLicenseApplication(dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.lists() })
    },
  })
}