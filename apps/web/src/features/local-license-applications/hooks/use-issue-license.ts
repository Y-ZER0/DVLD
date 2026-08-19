"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { localLicenseApplicationsService } from "../services/local-license-applications.service"
import { localLicenseApplicationKeys } from "../localLicenseApplicationKeys"
import type { IssueLicenseRequestDto } from "../dtos/issue-license-request.dto"

export function useIssueLicense(localDrivingLicenseApplicationId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: IssueLicenseRequestDto) =>
      localLicenseApplicationsService.issueLicense(localDrivingLicenseApplicationId, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: localLicenseApplicationKeys.detail(localDrivingLicenseApplicationId),
      })
      queryClient.invalidateQueries({ queryKey: localLicenseApplicationKeys.lists() })
    },
  })
}