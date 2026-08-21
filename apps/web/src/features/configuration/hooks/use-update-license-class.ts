"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { lookupKeys } from "@/features/lookup/lookupKeys"
import { configurationService } from "../services/configuration.service"
import type { UpdateLicenseClassRequestDto } from "../dtos/update-license-class-request.dto"

export function useUpdateLicenseClass() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateLicenseClassRequestDto }) =>
      configurationService.updateLicenseClass(id, dto),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lookupKeys.licenseClasses() })
    },
  })
}
