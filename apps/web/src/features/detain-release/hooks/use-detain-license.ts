"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { detainReleaseService } from "../services/detain-release.service"
import { detainReleaseKeys } from "../detainReleaseKeys"
import { driverKeys } from "@/features/drivers/driverKeys"
import { renewalsReplacementKeys } from "@/features/renewals-replacements/renewalsReplacementKeys"
import type { DetainLicenseRequestDto } from "../dtos/detain-license-request.dto"

export function useDetainLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: DetainLicenseRequestDto) => detainReleaseService.detainLicense(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detainReleaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: detainReleaseKeys.eligibleLicenses() })
      queryClient.invalidateQueries({ queryKey: driverKeys.all() })
      queryClient.invalidateQueries({ queryKey: renewalsReplacementKeys.all() })
    },
  })
}