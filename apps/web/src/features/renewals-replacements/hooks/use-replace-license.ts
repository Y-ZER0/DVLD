"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { licensesService } from "../services/licenses.service"
import { renewalsReplacementKeys } from "../renewalsReplacementKeys"
import type { ReplaceLicenseRequestDto } from "../dtos/replace-license-request.dto"

export function useReplaceLicense(licenseId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: ReplaceLicenseRequestDto) =>
      licensesService.replaceLicense(licenseId, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: renewalsReplacementKeys.lists() })
    },
  })
}