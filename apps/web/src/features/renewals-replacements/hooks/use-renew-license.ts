"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { licensesService } from "../services/licenses.service"
import { renewalsReplacementKeys } from "../renewalsReplacementKeys"
import type { RenewLicenseRequestDto } from "../dtos/renew-license-request.dto"

export function useRenewLicense(licenseId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: RenewLicenseRequestDto) =>
      licensesService.renewLicense(licenseId, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: renewalsReplacementKeys.lists() })
    },
  })
}