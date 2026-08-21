"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { detainReleaseService } from "../services/detain-release.service"
import { detainReleaseKeys } from "../detainReleaseKeys"
import { driverKeys } from "@/features/drivers/driverKeys"
import { renewalsReplacementKeys } from "@/features/renewals-replacements/renewalsReplacementKeys"

export function useReleaseLicense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (detainId: number) => detainReleaseService.releaseLicense(detainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: detainReleaseKeys.lists() })
      queryClient.invalidateQueries({ queryKey: detainReleaseKeys.eligibleLicenses() })
      queryClient.invalidateQueries({ queryKey: driverKeys.all() })
      queryClient.invalidateQueries({ queryKey: renewalsReplacementKeys.all() })
    },
  })
}